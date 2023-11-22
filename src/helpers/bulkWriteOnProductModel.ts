import { Model } from 'mongoose';
import { BulkWriteBatchType, IProduct } from '../types';

export async function bulkWriteOnProductModel(model: Model<IProduct>, batch: Array<BulkWriteBatchType>) {
  await model.bulkWrite(
    batch.map(({ productName, uniqueKey }) => ({
      updateOne: {
        filter: { name: productName },
        update: { $set: { uniqueKey } },
        upsert: true,
      },
    })),
  );
}
