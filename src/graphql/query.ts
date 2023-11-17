import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { IProducer, IProduct, ProducerType, ProductType } from '../types';
import { ProducerModel, ProductModel } from '../models';

export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    producers: {
      type: new GraphQLList(ProducerType),
      resolve: async (): Promise<Array<IProducer>> => {
        const producers: Array<IProducer> = (await ProducerModel.find()) || [];
        return producers;
      },
    },
    producer: {
      type: ProducerType,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (...[, args]): Promise<IProducer> => {
        const producer: IProducer = await ProducerModel.findById(args._id);
        return producer;
      },
    },
    products: {
      type: new GraphQLList(ProductType),
      resolve: async (): Promise<Array<IProduct>> => {
        const products: Array<IProduct> = (await ProductModel.find().populate('producer')) || [];
        return products;
      },
    },
    product: {
      type: ProductType,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (...[, args]): Promise<IProduct> => {
        const product: IProduct = await ProductModel.findById(args._id).populate('producer');
        return product;
      },
    },
  }),
});
