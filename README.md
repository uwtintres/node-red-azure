# node-red-azure-storage
## Introduction
**node-red-azure-storage** is a collection of nodes that perform uploading and downloading blob file from [Microsoft Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/).
## Installation
`npm install @intres/node-red-azure-storage`
## Example usage of Upload node
The example flow is shown as follows:

![Upload example flow](https://github.com/uwtintres/node-red-azure/blob/main/img/upload/upload-example-flow.png?raw=true)

1. Drag the `Upload` node from section `azure-blob-storage`.
2. In the editor section, select which mode to use and complete required inputs. The example below
shows what the inputs should look like. In this example, under `file` mode, the `Upload` node will try to locate the file `/Users/tsungjui/.node-red/music.wav`, upload it to Azure Blob Storage, under container `test`
   and name the blob `hello.wav`.
   
![Upload node configuration](https://github.com/uwtintres/node-red-azure/blob/main/img/upload/upload-file.png?raw=true)

3. Click Deploy in the top right corner.
4. Fire the inject node, and a response should be presented in the node-red debug tab.
   ![Upload response](https://github.com/uwtintres/node-red-azure/blob/main/img/upload/upload-response.png?raw=true)

## Example usage of Download node
The example flow is shown as follows:

![Download example flow](https://github.com/uwtintres/node-red-azure/blob/main/img/download/download-example-flow.png?raw=true)

In this example, we will download the blob `hello.wav` uploaded in the above example as binary content, and upload that binary content
to the container `test`, and name the blob `hello1.wav` using `Upload` node binary mode.

1. Drag `Upload` and `Download` node from section `azure-blob-storage`.
2. In the `Download` node's editor section, complete all the required inputs. In this example, we will try to download the blob named `hello.wav` in container `test`
   as binary content(by selecting `binary` mode).
   
   ![Download node configuration](https://github.com/uwtintres/node-red-azure/blob/main/img/download/download-file.png?raw=true)
   
3. In the `Upload` node's editor section, complete all the required inputs. In this example, the node will take `msg.payload` from `Download` node and upload that binary content to the same container `test`, but name it
   to `hello1.wav`.
   
   ![Upload binary configuration](https://github.com/uwtintres/node-red-azure/blob/main/img/download/upload-binary.png?raw=true)