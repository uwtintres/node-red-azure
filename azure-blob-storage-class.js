const azureStorageBlob = require("@azure/storage-blob");
const path = require('path');

class AzureBlobStorage {
    constructor(node, accountName, accountKey) {
        this.node = node;
        this.accountName = accountName;
        this.accountKey = accountKey;
        this.client = null;
    }

    createConnection() {
        // Create connection using StorageSharedKeyCredential
        if (!this.accountName) throw new Error('Account name must be provided');
        if (!this.accountKey) throw new Error('Account key must be provided');
        const sharedKeyCredential = new azureStorageBlob.StorageSharedKeyCredential(this.accountName, this.accountKey);
        return new azureStorageBlob.BlobServiceClient(
            `https://${this.accountName}.blob.core.windows.net`,
            sharedKeyCredential
        );
    }

    async uploadLocalFile(containerName, blobName, filePath) {
        if (typeof filePath !== 'string') throw new Error('msg.payload must be a string');
        if (!path.isAbsolute(filePath)) throw new Error('msg.payload must be a string of absolute file path');

        // If the msg.blobName is not given, use the original file name
        const finalBlobName = blobName || filePath.substring(filePath.lastIndexOf('/') + 1);
        this.client = this.createConnection();
        const containerClient = this.client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) await containerClient.create({ access: 'container' });
        const blockBlobClient = containerClient.getBlockBlobClient(finalBlobName);
        return await blockBlobClient.uploadFile(filePath);
    }

    async uploadBinaryFile(containerName, blobName, buffer) {
        if (!blobName) throw new Error('msg.blobName must be provided when msg.topic is "binary".');

        this.client = this.createConnection();
        const containerClient = this.client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) await containerClient.create({ access: 'container' });
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return await blockBlobClient.uploadData(buffer);
    }

    async run(operation, options) {
        // Update status in the node
        this.node.status({
            fill: 'green',
            shape: 'dot',
            text: 'Uploading',
        });

        let res;
        if (operation === 'file') {
            const { containerName, blobName, payload } = options;
            res = await this.uploadLocalFile(containerName, blobName, payload);
        } else if (operation === 'binary') {
            const { containerName, blobName, payload } = options;
            res = await this.uploadBinaryFile(containerName, blobName, payload);
        } else throw new Error('msg.topic must be either "file" or "binary".');

        // Clear status in the node
        this.node.status({});
        return res;
    }
}

module.exports = AzureBlobStorage;
