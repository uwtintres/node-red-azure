const AzureBlobStorage = require('./azure-blob-storage-class');

module.exports = function(RED) {
    function azureBlobStorageUpload(config) {
        RED.nodes.createNode(this, config);
        const azureBlobStorageIns = new AzureBlobStorage(this, this.credentials.accountName, this.credentials.accountKey);
        this.on('input', async (msg) => {
            if (!msg.payload) this.error('msg.payload must be provided', msg);
            const options = {
                payload: msg.payload,
                blobName: msg.blobName || '',
                containerName: config.containerName,
            };
            try {
                const res = await azureBlobStorageIns.run(msg.topic, options);
                this.send(res);
            } catch(e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    function azureBlobStorageDownload(config) {
        RED.nodes.createNode(this, config);
        const azureBlobStorageIns = new AzureBlobStorage(this, this.credentials.accountName, this.credentials.accountKey);
        this.on('input', async (msg) => {
            try {
                const options = {
                    payload: msg.payload,
                    blobName: msg.blobName,
                    containerName: config.containerName,
                };
                const res = await azureBlobStorageIns.runDownload(msg.topic, options);
                this.send({ payload: res });
            } catch(e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }


    RED.nodes.registerType("azure-blob-storage-upload", azureBlobStorageUpload, {
        credentials: {
            accountName: { type: 'text' },
            accountKey: { type: 'password' }
        },
    });

    RED.nodes.registerType("azure-blob-storage-download", azureBlobStorageDownload, {
        credentials: {
            accountName: { type: 'text' },
            accountKey: { type: 'password' }
        },
    });
}
