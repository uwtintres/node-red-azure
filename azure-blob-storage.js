const AzureBlobStorage = require('./azure-blob-storage-class');

module.exports = function(RED) {
    function azureBlobStorage(config) {
        RED.nodes.createNode(this, config);
        const azureBlobStorageIns = new AzureBlobStorage(this, this.credentials.accountName, this.credentials.accountKey);
        this.on('input', async (msg) => {
            if (!msg.payload) return;
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
                this.node.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }
    RED.nodes.registerType("azure-blob-storage", azureBlobStorage, {
        credentials: {
            accountName: { type: 'text' },
            accountKey: { type: 'password' }
        },
    });
}
