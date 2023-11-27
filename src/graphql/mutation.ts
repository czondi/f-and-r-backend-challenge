import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLObjectType, GraphQLBoolean } from 'graphql';
import { startSession } from 'mongoose';
import { parse } from 'csv-parse';
import { ProductType, IProduct, ProductInput, BulkWriteBatchType } from '../types';
import { bulkWriteOnProductModel } from '../helpers';
import { fetchFile } from '../helpers/fetchFile';
import { ProducerModel, ProductModel } from '../models';

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createProducts: {
      type: new GraphQLList(ProductType),
      args: {
        products: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProductInput))) },
      },
      resolve: async (...[, args]): Promise<Array<IProduct>> => {
        const products: Array<IProduct> = [];
        const session = await startSession();

        await session.withTransaction(async () => {
          for (const product of args.products) {
            const newProduct = await ProductModel.create(product);
            await newProduct.populate('producer');

            products.push(newProduct);
          }
        });

        return products;
      },
    },
    updateProduct: {
      type: ProductType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
        product: { type: new GraphQLNonNull(ProductInput) },
      },
      resolve: async (...[, args]): Promise<IProduct> => {
        let product: IProduct;
        const session = await startSession();

        await session.withTransaction(async () => {
          product = await ProductModel.findByIdAndUpdate(args._id, args.product, { new: true });
          await product.populate('producer');
        });

        return product;
      },
    },
    deleteProducts: {
      type: new GraphQLList(ProductType),
      args: {
        _ids: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
      },
      resolve: async (...[, args]): Promise<Array<IProduct>> => {
        const deletedProducts: Array<IProduct> = [];
        const session = await startSession();

        await session.withTransaction(async () => {
          for (const _id of args._ids) {
            const product: IProduct = await ProductModel.findByIdAndDelete(_id).populate('producer');
            deletedProducts.push(product);
          }
        });

        await session.endSession();

        return deletedProducts;
      },
    },
    processCSV: {
      type: GraphQLBoolean,
      resolve: async (): Promise<boolean> => {
        // start a process in the background
        process.nextTick(async () => {
          try {
            const session = await startSession();

            await session.withTransaction(async () => {
              const batch: Array<BulkWriteBatchType> = [];

              console.log('Fetching CSV file...');
              const csv = await fetchFile('https://api.frw.co.uk/feeds/all_listings.csv');

              console.log('CSV file fetched! Parsing...');
              const parser = parse(csv, { columns: true });

              parser.on('readable', async () => {
                let row: any;
                while ((row = parser.read()) !== null) {
                  const productName = row['Product Name'];
                  const uniqueKey = `${row.Vintage}-${productName}-${row.Producer}`;

                  batch.push({ productName, uniqueKey });

                  if (batch.length === 100) {
                    await bulkWriteOnProductModel(batch);

                    // reset batch
                    batch.length = 0;
                  }
                }
              });

              parser.on('end', async () => {
                // finish remaining batch
                if (batch.length > 0) {
                  await bulkWriteOnProductModel(batch);
                }

                console.log('CSV file successfully processed!');
              });
            });
          } catch (error) {
            console.error(error);
          }
        });

        return true;
      },
    },
    initDB: {
      type: GraphQLBoolean,
      resolve: async (): Promise<boolean> => {
        // start a process in the background
        process.nextTick(async () => {
          try {
            const session = await startSession();

            await session.withTransaction(async () => {
              console.log('Initializing DB. Fetching CSV file...');
              const csv = await fetchFile('https://api.frw.co.uk/feeds/all_listings.csv');

              console.log('CSV file fetched! Parsing...');
              const parser = parse(csv, { columns: true });

              parser.on('readable', async () => {
                let row: any;
                while ((row = parser.read()) !== null) {
                  // if producer exists
                  if (row.Producer) {
                    const producer = {
                      name: row.Producer,
                      country: row.Country,
                      region: row.Region,
                    };

                    const result = await ProducerModel.findOneAndUpdate({ name: producer.name }, producer, { upsert: true, new: true });

                    const product = {
                      vintage: row.Vintage,
                      name: row['Product Name'],
                      producerId: result._id,
                      producer: result,
                    };

                    await ProductModel.findOneAndUpdate({ name: product.name }, product, { upsert: true, new: true });
                  }
                }
              });

              parser.on('end', async () => {
                console.log('CSV file successfully processed! DB initialized!');
              });
            });
          } catch (error) {
            console.error(error);
          }
        });

        return true;
      },
    },
  }),
});
