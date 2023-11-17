import { GraphQLList, GraphQLNonNull, GraphQLString, GraphQLObjectType } from 'graphql';
import { ProductType, IProduct, ProductInput } from '../types';
import { startSession } from 'mongoose';
import { ProductModel } from '../models/product';

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
  }),
});
