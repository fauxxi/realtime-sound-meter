import S3 from 'aws-sdk/clients/s3';

const s3 = new S3({
	region: 'eu-central-1',
	accessKeyId: process.env.ACCESS_KEY,
	secretAccessKey: process.env.SECRET_KEY,
	signatureVersion: 'v4',
});

export default async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	let { name, type } = req.body;

	const fileParams = {
		Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
		Key: name,
		Expires: 600,
		ContentType: type,
	};

	try {
		const url = await s3.getSignedUrlPromise('putObject', fileParams);

		res.status(200).json({ url });
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: err });
	}
};

export const config = {
	api: {
		bodyParser: {
			sizeLimit: '8mb', // Set desired value here
		},
	},
};
