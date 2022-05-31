const expect = require('expect.js');
const helper = require("node-red-node-test-helper");
const uploadNode = require('../azure-blob-storage-upload.js');

helper.init(require.resolve('node-red'));

describe('uploadBinaryFile with helper', function() {
    const buffer = Buffer.from('test');
    const flow = [{ 
        id: "n1", 
        type: "Upload", 
        name: "test name", 
        blobName: 'test.pdf', 
        mode: 'binary', 
        filePath: '' 
    }];
    const config = flow[0];

    beforeEach(function (done) {
        helper.startServer(done);
    });
  
    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('Node should be loaded', function (done) {
        helper.load(uploadNode, flow, function () {
            const n1 = helper.getNode("n1");
            try {
                expect(n1).to.have.property('name', 'test name');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('Blobname is taken from config, should be set to test.pdf', function (done) {
        helper.load(uploadNode, flow, function () {
            let n1 = helper.getNode("n1");

            n1.on('input', msg => {
                // mimics the options object from the azureBlobStorageUpload node
                const options = {
                    buffer: msg.payload,
                    filePath: config.filePath,
                    blobName: msg.blobName || config.blobName,
                    containerName: config.containerName,
                };
                try {
                    expect(options.blobName).to.be('test.pdf');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            n1.receive({ payload: buffer });

        });
    });

    it('Blobname should be overridden by msg.blobName to override.pdf', function (done) {
        helper.load(uploadNode, flow, function () {
            let n1 = helper.getNode("n1");

            n1.on('input', msg => {
                // mimics the options object from the azureBlobStorageUpload node
                const options = {
                    buffer: msg.payload,
                    filePath: config.filePath,
                    blobName: msg.blobName || config.blobName,
                    containerName: config.containerName,
                };
                try {
                    expect(options.blobName).to.be('override.pdf');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            // passes in msg with msg.blobName set to override.pdf
            n1.receive({ payload: buffer, blobName: 'override.pdf' });

        });
    });
});