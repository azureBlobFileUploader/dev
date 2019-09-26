var azureBlobFileUploader = {
  uploadBlobLib: function(option) {
    return new Promise(function(resolve, reject) {
      try {
        option.displayProcess && option.displayProcess(0);
        var blobService = AzureStorage.Blob.createBlobServiceWithSas(
          option.blobUri,
          option.sasToken
        );
        var customBlockSize =
          option.file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
        blobService.singleBlobPutThresholdInBytes = customBlockSize;
        var finishedOrError = false;
        var speedSummary = blobService.createBlockBlobFromBrowserFile(
          option.container,
          option.path + option.file.name,
          option.file,
          { blockSize: customBlockSize },
          function(error, result, response) {
            finishedOrError = true;
            if (error) {
              reject(error);
            } else {
              option.displayProcess && option.displayProcess(100, speedSummary);
              resolve(speedSummary);
            }
          }
        );

        function refreshProgress() {
          setTimeout(function() {
            if (!finishedOrError) {
              var process = speedSummary.getCompletePercent();
              option.displayProcess &&
                option.displayProcess(process, speedSummary);
              refreshProgress();
              if (process === 100) {
                resolve(speedSummary);
              }
            }
          }, 200);
        }
        refreshProgress();
      } catch (error) {
        reject(error);
      }
    });
  }
};

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = azureBlobFileUploader;
}
