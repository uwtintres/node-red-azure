const path = require('path');
const os = require('os');
const azureStorageBlob = require("@azure/storage-blob");

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
        if (typeof filePath !== 'string') throw new Error('File path must be a string');
        if (!path.isAbsolute(filePath)) throw new Error('File path must be a string of absolute file path');

        // If the msg.blobName is not given, use the original file name
        const finalBlobName = blobName || filePath.substring(filePath.lastIndexOf('/') + 1);
        this.client = this.createConnection();
        const containerClient = this.client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) await containerClient.create({ access: 'container' });
        const blockBlobClient = containerClient.getBlockBlobClient(finalBlobName);
        const res = await blockBlobClient.uploadFile(filePath);
        return { success: true, date: res.date };
    }

    async uploadBinaryFile(containerName, blobName, buffer) {
        if (!blobName) throw new Error('blobName must be provided when mode is "binary"');
        if (!buffer) throw new Error('msg.payload must be provided as an instance of Buffer');

        this.client = this.createConnection();
        const containerClient = this.client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) await containerClient.create({ access: 'container' });
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const res = await blockBlobClient.uploadData(buffer);
        return { success: true, date: res.date };
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
            const { containerName, blobName, filePath } = options;
            res = await this.uploadLocalFile(containerName, blobName, filePath);
        } else if (operation === 'binary') {
            const { containerName, blobName, buffer } = options;
            res = await this.uploadBinaryFile(containerName, blobName, buffer);
        } else throw new Error('Mode must be either "file" or "binary".');

        // Clear status in the node
        this.node.status({});
        return res;
    }

    async downloadFile(containerName, blobName, filePathToStore) {
        if (!blobName) throw new Error('blobName must be provided for downloading');
        // If filePathToStore is not given, default location is $HOME/.node-red
        const finalFilePath = filePathToStore || `${os.homedir()}/.node-red/${blobName}`;
        if (typeof finalFilePath !== 'string') throw new Error('filePathToStore must be a string, if explicitly given');
        if (!path.isAbsolute(finalFilePath)) throw new Error('filePathToStore must be a string of absolute file path');

        this.client = this.createConnection();
        const containerClient = this.client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) throw new Error(`Container ${containerName} does not exist`);
        const blobClient = containerClient.getBlobClient(blobName);
        const blobExists = await blobClient.exists();
        if (!blobExists) throw new Error(`Blob ${blobName} does not exist in container ${containerName}`);
        const res = await blobClient.downloadToFile(finalFilePath);
        return { success: true, date: res.date, fileLocation: finalFilePath };
    }

    async downloadBinary(containerName, blobName) {
        if (!blobName) throw new Error('blobName must be provided for downloading');

        this.client = this.createConnection();
        const containerClient = this.client.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) throw new Error(`Container ${containerName} does not exist`);
        const blobClient = containerClient.getBlobClient(blobName);
        const blobExists = await blobClient.exists();
        if (!blobExists) throw new Error(`Blob ${blobName} does not exist in container ${containerName}`);

        const buffer = await blobClient.downloadToBuffer();
        return { success: true, buffer };
    }

    async runDownload(operation, options) {
        // Update status in the node
        this.node.status({
            fill: 'green',
            shape: 'dot',
            text: 'Downloading',
        });

        let res;
        if (operation === 'file') {
            const { containerName, blobName, payload } = options;
            res = await this.downloadFile(containerName, blobName, payload);
        } else if (operation === 'binary') {
            const { containerName, blobName } = options;
            res = await this.downloadBinary(containerName, blobName);
        } else throw new Error('Mode must be either "file" or "binary".');

        // Clear status in the node
        this.node.status({});
        return res;
    }
}

module.exports = AzureBlobStorage;
