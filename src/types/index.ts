import { Document } from 'mongoose';
import { GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export interface IProducer extends Document {
  _id: string;
  name: string;
  country?: string;
  region?: string;
}

export const ProducerType = new GraphQLObjectType({
  name: 'ProducerType',
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString },
    region: { type: GraphQLString },
  }),
});

export const ProducerInput = new GraphQLInputObjectType({
  name: 'ProducerInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString },
    region: { type: GraphQLString },
  }),
});

export interface IProduct extends Document {
  _id: string;
  vintage: string;
  name: string;
  producerId: string;
  producer: IProducer;
}

export const ProductType = new GraphQLObjectType({
  name: 'ProductType',
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLString) },
    vintage: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    producerId: { type: new GraphQLNonNull(GraphQLID) },
    producer: { type: new GraphQLNonNull(ProducerType) },
  }),
});

export const ProductInput = new GraphQLInputObjectType({
  name: 'ProductInput',
  fields: () => ({
    vintage: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    producerId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});
