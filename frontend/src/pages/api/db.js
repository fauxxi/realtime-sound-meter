import dynamoDb from '../../utils/db';
import _ from 'lodash';

export default async function handler(req, res) {
	if (req.method === 'PUT') {
		let recordedAudioRaw = _.map(req.body.recordedAudio, (o) =>
			_.omit(o, ['id'])
		);
		const item = {
			id: req.body.id,
			sessionId: req.body.sessionId,
			recordedAudio: recordedAudioRaw,
			createdAt: Date.now(),
		};

		await dynamoDb.put({
			Item: item,
		});

		res.status(201).json(item);
	}

	if (req.method === 'GET') {
		const { Item } = await dynamoDb.get({
			Key: {
				id: req.query.id,
			},
		});

		res.status(200).json(Item);
	}

	if (req.method === 'POST') {
		const { Attributes } = await dynamoDb.update({
			Key: {
				id: req.body.id,
			},
			UpdateExpression: 'SET content = :content',
			ExpressionAttributeValues: {
				':content': req.body.content || null,
			},
			ReturnValues: 'ALL_NEW',
		});

		res.status(200).json(Attributes);
	}

	if (req.method === 'DELETE') {
		await dynamoDb.delete({
			Key: {
				id: req.query.id,
			},
		});

		res.status(204).json({});
	}
}
