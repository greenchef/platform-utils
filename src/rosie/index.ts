import mongoose, { Model, Document } from 'mongoose';
import { IFactory } from 'rosie';

export interface IGCFactory extends IFactory {
	statics?: any;
}

export interface IExtendedFactory<T extends Document> extends IGCFactory {
	clearAll: () => Promise<{
		ok?: number | undefined;
		n?: number | undefined;
	} & {
		deletedCount?: number | undefined;
	}>;
	create: (attrs?: any, options?: any) => Promise<T> | null;
	createMany: (num: number, attrs?: any, options?: any) => Promise<(T | null)[]>;
	requestPayload: (attrs?: any) => any;
	seed: (seedName: string, params?: any) => Promise<T | (T | null)[] | null>;
	seedMany: (seedName: string, params: any, num: number) => Promise<(T | null)[] | (T | null)[][]>;
}

export const extendFactory = <T extends Document>(factory: IGCFactory, Model: Model<T>) => {
	const clearAll = () => Model.deleteMany({}).exec();

	const create = (attrs: any = {}, options: any = {}) => {
		try {
			if (!Model) return null;
			return new Model(factory.build(attrs, options)).save();
		} catch (err) {
			console.log(err);
		}
		return null;
	};

	/**
  * Create multiple records at once
  * @param {number} num - how many to create
  * @param {Object} [attrs] - attributes to apply to factory objects created
  * @return {Promise<Model[]>}
  */
	const createMany = async (num: number, attrs: any = {}, options: any = {}) => {
		return Promise.all(Array.from(Array(num)).map(() => create(attrs, options)));
	};

	const requestPayload = (attrs: any = {}) => {
		const fac = factory.build(attrs);
		Object.keys(fac).forEach((x) => {
			if (fac[x] instanceof mongoose.Types.ObjectId) {
				fac[x] = fac[x].toString();
			}
		});
		return fac;
	};

	const seed = async (seedName: string, params: any) => {
		const { seeds } = factory.statics;
		if (seedName === 'all') {
			return Promise.all(Object.values(seeds).map((seedDefinition: any) => create({ ...seedDefinition, ...params })));
		}
		const seedDefinition = seeds[seedName] || {};
		return create({ ...seedDefinition, ...params });
	}

	const seedMany = async (seedName: string, params: any, num: number) => {
		const { seeds } = factory.statics;
		if (seedName === 'all') {
			return Promise.all(Object.values(seeds).map((seedDefinition: any) => createMany({ ...seedDefinition, ...params }, num)));
		}
		const seedDefinition = seeds[seedName] || {};
		return createMany({ ...seedDefinition, ...params }, num);
	}

	return { ...factory, create, createMany, clearAll, requestPayload, seed, seedMany } as IExtendedFactory<T>;
};
