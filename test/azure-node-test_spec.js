const os = require('os');
const sinon = require('sinon');
const expect = require('expect.js');
const helper = require("node-red-node-test-helper");
const AzureBlobStorage = require('../azure-blob-storage-class');
const uploadNode = require('../azure-blob-storage-upload.js');

helper.init(require.resolve('node-red'));

describe('uploadBinaryFile with helper', function() {
    const buffer = Buffer.from('test');

    beforeEach(function (done) {
        helper.startServer(done);
    });
  
    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('Node should be loaded', function (done) {
        const flow = [{ id: "n1", type: "Upload", name: "test name", accountName: 'testing' }];
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

    // it('Error with no blobName input property', function (done) {
    //     let flow = [{ id: "n1", type: "Aleph Get Blob", name: "test name" }];
    //     let testCredentials = { n1: { accountname: "fake", key: "fake", container: "fake" } };
    
    //     helper.load(getBlobNode, flow, testCredentials, function () {
    //         let n1 = helper.getNode("n1");
    //         const buffer = Buffer.from('test');

    //         n1.receive({ payload: buffer });
        
    //         n1.on('call:error', call => {
    //             call.should.be.calledWithExactly('No BlobName defined');
    //             done();
    //         });
    //     });
    // });

    it('Save Blob correct output', function (done) {
        let flow = [{ id: "n1", type: "Upload", name: "test name", wires: [["n2"]] },
        { id: "n2", type: "helper" }];
        let testCredentials = { n1: { accountname: "fake", key: "fake", container: "fake" } };

        helper.load(uploadNode, flow, testCredentials, function () {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");

            n1.receive({ payload: buffer, blobName: "testingBlob" });

            n2.on("input", function (msg) {
                // console.log(msg);
                try {
                    msg.should.have.property('payload', buffer);
                    msg.should.have.property('blobName', 'testingBlob');
                    // msg.should.have.property('status', 'OK');
                    done();
                } catch (err) {
                    done(err);
                }
            });

        });
    });
});