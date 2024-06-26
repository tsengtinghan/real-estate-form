import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Upload, File, X, Loader } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [packageName, setPackageName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  const showNotification = (title: string, description: string) => {
    setAlertMessage({ title, description });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 8000); // Hide the alert after 5 seconds
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append("files", file);
    });

    formData.append("name", packageName);

    fetch("http://127.0.0.1:8000/createPackage", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        pollPackageStatus(data.packageId);
      })
      .catch((error) => console.error("Error:", error));
  };

  const pollPackageStatus = (packageId: number) => {
    setIsLoading(true);
    const interval = setInterval(() => {
      fetch(`http://127.0.0.1:8000/getPackageStatus?packageId=${packageId}`)
        .then((response) => response.text())
        .then((statusText) => {
          statusText = statusText.replace(/^"|"$/g, "").trim();
          console.log("Formatted status text:", statusText);
          if (statusText === "Complete") {
            clearInterval(interval);
            setIsLoading(false);
            console.log("Package creation is complete.");
            showNotification(
              "Package Ready",
              "Your package has been successfully created!"
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          clearInterval(interval);
          showNotification(
            "Error",
            "An error occurred while checking the package status."
          );
        });
    }, 2000);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handlePackageNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPackageName(event.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white pb-36">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {showAlert && (
          <Alert variant="default">
            <AlertTitle className="text-green-400">{alertMessage.title}</AlertTitle>
            <AlertDescription >{alertMessage.description}</AlertDescription>
          </Alert>
        )}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Upload Package
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="package-name"
              className="block text-sm font-medium text-gray-700"
            >
              Package Name
            </label>
            <input
              id="package-name"
              type="text"
              placeholder="Enter package name"
              value={packageName}
              onChange={handlePackageNameChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700"
            >
              Select Files
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
          {files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Files:
              </h3>
              <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center">
                      <File className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-4 flex-shrink-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Processing...
                </>
              ) : (
                "Upload Files"
              )}
            </button>
          </div>
        </form>
        {isLoading && (
          <div className="text-center text-sm text-gray-500">
            Creating your package. This may take a few moments...
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
