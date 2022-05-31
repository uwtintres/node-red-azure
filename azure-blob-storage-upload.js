const AzureBlobStorage = require('./azure-blob-storage-class');

module.exports = function(RED) {
    function azureBlobStorageUpload(config) {
        RED.nodes.createNode(this, config);
        const azureBlobStorageIns = new AzureBlobStorage(this, this.credentials.accountName, this.credentials.accountKey);
        this.on('input', async (msg) => {
            const options = {
                buffer: msg.payload,
                filePath: config.filePath,
                // Allow blobName to be overwritten by msg.blobName
                blobName: msg.blobName || config.blobName,
                containerName: config.containerName,
            };
            try {
                const res = await azureBlobStorageIns.run(config.mode, options);
                this.send({ payload: res });
            } catch(e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    RED.nodes.registerType("Upload", azureBlobStorageUpload, {
        credentials: {
            accountName: { type: 'text' },
            accountKey: { type: 'password' }
        },
    });
}
