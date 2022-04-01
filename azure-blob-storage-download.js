const AzureBlobStorage = require('./azure-blob-storage-class');

module.exports = function(RED) {
    function azureBlobStorageDownload(config) {
        RED.nodes.createNode(this, config);
        const azureBlobStorageIns = new AzureBlobStorage(this, this.credentials.accountName, this.credentials.accountKey);
        this.on('input', async (msg) => {
            try {
                const options = {
                    filePathToStore: config.filePathToStore,
                    blobName: config.blobName,
                    containerName: config.containerName,
                };
                const res = await azureBlobStorageIns.runDownload(config.mode, options);
                this.send({payload: res});
            } catch (e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    RED.nodes.registerType("azure-blob-storage-download", azureBlobStorageDownload, {
        credentials: {
            accountName: { type: 'text' },
            accountKey: { type: 'password' }
        },
    });
}