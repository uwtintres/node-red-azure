const os = require('os');
const sinon = require('sinon');
const expect = require('expect.js');
const AzureBlobStorage = require('../azure-blob-storage-class');

describe('Azure Blob Storage class', function() {
    describe('Upload related functionalities', function() {
        let fakeClient, fakeContainerClient, fakeBlockBlobClient;
        beforeEach(function() {
            fakeClient = {
                getContainerClient: () => {},
            };

            fakeContainerClient = {
                exists: () => {},
                getBlockBlobClient: () => {},
            };

            fakeBlockBlobClient = {
                uploadFile: () => {},
            };

            // Fake res = { date: 1 }
            sinon.replace(fakeBlockBlobClient, 'uploadFile', sinon.fake.resolves({ date: 1 }));
            sinon.replace(fakeContainerClient, 'exists', sinon.fake.resolves(true));
            sinon.replace(fakeContainerClient, 'getBlockBlobClient', sinon.fake.returns(fakeBlockBlobClient));
            sinon.replace(fakeClient, 'getContainerClient', sinon.fake.returns(fakeContainerClient));
        });

        afterEach(function() {
            sinon.restore();
        });

        describe('uploadLocalFile', function() {
            it('File path must be a string', function() {
                const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                const bind = azureBlobStorage.uploadLocalFile.bind(azureBlobStorage, 1, 1, [1, 2, 3]);
                sinon.replace(azureBlobStorage, 'createConnection', sinon.fake.returns(fakeClient));
                return bind()
                        .then(res => {
                            throw new Error('Should not succeed');
                        })
                        .catch(e => {
                            expect(e).to.be.an(Error);
                            expect(e.message).to.equal('File path must be a string');
                            // fakeBlockBlobClient.uploadFile shouldn't be reached
                            expect(fakeBlockBlobClient.uploadFile.calledOnce).to.be(false);
                        });
            });


            const testCases = ['../test', 'test/test1/']
            testCases.forEach((testCase, index) => {
                it(`Throw error - File path must be a string of absolute file path with ${testCase}`, function() {
                    const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                    const bind = azureBlobStorage.uploadLocalFile.bind(azureBlobStorage, 1, 1, testCase);

                    return bind()
                            .then(res => {
                                throw new Error('Should not succeed');
                            })
                            .catch(e => {
                                expect(e).to.be.an(Error);
                                expect(e.message).to.equal('File path must be a string of absolute file path');
                            });
                });
            });

            it('Should use the original file name', function() {
                const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                const bind = azureBlobStorage.uploadLocalFile.bind(azureBlobStorage, 1, null, '/test/fake.jpg');
                sinon.replace(azureBlobStorage, 'createConnection', sinon.fake.returns(fakeClient));

                return bind()
                        .then(res => {
                            expect(res).to.eql({ success: true, date: 1 });
                            expect(fakeContainerClient.getBlockBlobClient.calledWith('fake.jpg')).to.be(true);
                            expect(fakeBlockBlobClient.uploadFile.calledOnce).to.be(true);
                            expect(fakeBlockBlobClient.uploadFile.calledWith('/test/fake.jpg')).to.be(true);
                        })
                        .catch(e => {
                            throw e;
                        });
            });
        });

        describe('uploadBinaryFile', function() {
            it('Throw error - blobName should not be null', function() {
                const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                const bind = azureBlobStorage.uploadBinaryFile.bind(azureBlobStorage, 1, null, null);
                return bind()
                    .then(res => {
                        throw new Error('Should not succeed');
                    })
                    .catch(e => {
                        expect(e).to.be.an(Error);
                        expect(e.message).to.equal('blobName must be provided when mode is "binary"');
                    });
            });
        });
    });

    describe('Download related functionalities', function() {
        let fakeClient, fakeContainerClient, fakeBlobClient;
        beforeEach(function() {
            fakeClient = {
                getContainerClient: () => {},
            };

            fakeContainerClient = {
                exists: () => {},
                getBlobClient: () => {},
            };

            fakeBlobClient = {
                exists: () => {},
                downloadToFile: () => {},
                downloadToBuffer: () => {},
            };

            sinon.replace(fakeBlobClient, 'exists', sinon.fake.resolves(true));
            sinon.replace(fakeBlobClient, 'downloadToFile', sinon.fake.resolves({ date: 1 }));
            sinon.replace(fakeBlobClient, 'downloadToBuffer', sinon.fake.resolves('fakeBuffer'));
            sinon.replace(fakeContainerClient, 'exists', sinon.fake.resolves(true));
            sinon.replace(fakeContainerClient, 'getBlobClient', sinon.fake.returns(fakeBlobClient));
            sinon.replace(fakeClient, 'getContainerClient', sinon.fake.returns(fakeContainerClient));
        });

        afterEach(function() {
            sinon.restore();
        });

        describe('downloadFile', function() {
            it('Should use $HOME/.node-red as destination, and response should contain the file location', function() {
                const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                const bind = azureBlobStorage.downloadFile.bind(azureBlobStorage, 1, 'fakeBlobName', null);
                sinon.replace(azureBlobStorage, 'createConnection', sinon.fake.returns(fakeClient));
                return bind()
                    .then(res => {
                        expect(res).to.eql(`${os.homedir()}/.node-red/fakeBlobName`);
                        expect(fakeBlobClient.downloadToFile.calledOnce).to.be(true);
                        expect(fakeBlobClient.downloadToFile.calledWith(`${os.homedir()}/.node-red/fakeBlobName`)).to.be(true);
                    })
                    .catch(e => {
                        throw e;
                    });
            });

            it('Throw error - filePathToStore must be a string, if explicitly given', function() {
                const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                const bind = azureBlobStorage.downloadFile.bind(azureBlobStorage, 1, 'fakeBlobName', [1, 2, 3]);
                sinon.replace(azureBlobStorage, 'createConnection', sinon.fake.returns(fakeClient));
                return bind()
                    .then(res => {
                       throw new Error('Should not succeed');
                    })
                    .catch(e => {
                        expect(e).to.be.an(Error);
                        expect(e.message).to.equal('filePathToStore must be a string, if explicitly given');
                    });
            });
        });

        describe('downloadBinary', function() {
            it('Response should contain the buffer returned from the api call', function() {
                const azureBlobStorage = new AzureBlobStorage('fake', 'fake', 'fake');
                const bind = azureBlobStorage.downloadBinary.bind(azureBlobStorage, 1, 'fakeBlobName');
                sinon.replace(azureBlobStorage, 'createConnection', sinon.fake.returns(fakeClient));
                return bind()
                        .then(res => {
                            expect(res).to.eql('fakeBuffer');
                        })
                        .catch(e => {
                            throw e;
                        });
            });
        });
    });
});
