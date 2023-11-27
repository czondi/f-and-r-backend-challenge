import { BulkWriteBatchType } from '../types';
import { ProductModel } from '../models';

export async function bulkWriteOnProductModel(batch: Array<BulkWriteBatchType>) {
  await ProductModel.bulkWrite(
    batch.map(({ productName, uniqueKey }) => ({
      updateOne: {
        filter: { name: productName },
        update: { $set: { uniqueKey } },
        upsert: true,
        strict: false, // allow to disregard schema
      },
    })),
  );
}
