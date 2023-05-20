// import { ObjectId } from "@fastify/mongodb";
import { FastifyInstance /* FastifyReply, FastifyRequest*/ } from "fastify";
// import { FormPublish, StoreForm } from '../../../../types/store'

// type Params = { id: string }
// type BulkParams = { page: number, limit?: number }

// function formatForm(data: FormPublish) {
//     return {
//         _id: data._id,
//         submitter: data.submitter,
//         type: data.type,
//         repoUrl: data.repoUrl,
//         description: data.description
//     }
// }

// async function fetchPlugins(this: FastifyInstance, request: FastifyRequest<{ Querystring: BulkParams }>) {
//     const page = (request.query.page ?? 1) - 1
//     const limit = request.query.limit ?? 50

//     const cursor = this.mongo.db!.collection<StoreForm>('forms').find({
//         kind: 'publish',
//         type: 'plugin',
//         approved: true
//     }, {
//         limit: limit, skip: page * limit
//     })

//     const res = await cursor.toArray();

//     return {
//         data: res.map((r) => formatForm(r as FormPublish)),
//         page
//     }
// }

// async function fetchPlugin(this: FastifyInstance, request: FastifyRequest<{Params: Params}>, reply: FastifyReply) {
//     const entity = await this.mongo.db!.collection<StoreForm>('form').findOne({
//         kind: 'publish',
//         _id: new ObjectId(request.params.id),
//         type: 'plugin',
//         approved: true
//     })

//     if(!entity) {
//         reply.callNotFound();
//         return;
//     }

//     return entity
// }

export default function (_fastify: FastifyInstance, _: unknown, done: () => void): void {
  // fastify.get('/plugins', fetchPlugins)
  // fastify.get('/plugins/:id', fetchPlugin)
  done();
}
