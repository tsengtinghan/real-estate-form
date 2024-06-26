"use client";
import React, { useEffect, useState } from "react";
import { Widget } from "@typeform/embed-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FormField {
  name: string;
  description: string;
  formFieldType: string;
}

interface filledOutPackage {
  pdfPath: string;
  email: string;
}

interface Package {
  packageId: string;
  packageName: string;
  packageStatus: string;
  originalPdfPath: string;
  imagesWithBoxesPaths: string[];
  formFields: FormField[];
  filledOutPackages: filledOutPackage[];
  typeformId: string;
  typeformUrl: string;
}

const ImageModal = ({
  image,
  onClose,
}: {
  image: string;
  onClose: () => boolean;
}) => (
  <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-xl max-h-[100vh] w-full mx-4">
        <img
          src={image}
          alt="Expanded view"
          className="w-full h-full object-contain"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
);

export default function PackagePage({ params }: { params: { id: string } }) {
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  /**
   * Extracts the filename from a full path and prepends it with '/storage/'.
   * @param {string} fullPath The full path of the file.
   * @returns {string} The modified path with only the filename, prefixed by '/storage/'.
   */
  function simplifyImagePath(fullPath: string) {
    const filename = fullPath.split("/").pop(); // Gets the last part of the path
    return `/storage/${filename}`;
  }

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/getPackage?packageId=${params.id}`)
      .then((response) => response.json())
      .then((data: Package) => {
        data.originalPdfPath = simplifyImagePath(data.originalPdfPath);
        data.filledOutPackages = data.filledOutPackages.map((filledOutPackage) => {
          return {pdfPath: simplifyImagePath(filledOutPackage.pdfPath), email: filledOutPackage.email}
        });
        data.imagesWithBoxesPaths = data.imagesWithBoxesPaths.map((path) =>
          simplifyImagePath(path)
        );
        setPackageDetails(data);
      })
      .catch((error) =>
        console.error("Failed to fetch package details:", error)
      );
  }, [params.id]);

  if (!packageDetails) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="container px-24 py-8">
      <Link href={packageDetails.typeformUrl}>
      <h1 className="text-3xl font-bold text-center mb-8">
        {packageDetails.packageName}
      </h1>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Raw PDF</h2>
          <iframe
            src={packageDetails.originalPdfPath}
            className="w-full h-96"
            title="Original PDF"
          ></iframe>
          <div id="widget-container" className="mt-10">
            <Widget id={packageDetails.typeformId} className="w-full h-64" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Images with Boxes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packageDetails.imagesWithBoxesPaths.map((image, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => setExpandedImage(image)}
              >
                <img
                  src={`${image}`}
                  alt={`Image with Box ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2 text-center">
                  <span className="text-sm text-gray-600">
                    Image {index + 1} (Click to expand)
                  </span>
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            Filled Out Packages
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packageDetails.filledOutPackages.map(
                (filledOutPackage, index) => (
                  <TableRow key={index}>
                    <TableCell>{filledOutPackage.email}</TableCell>
                    <TableCell>
                      <a
                        href={filledOutPackage.pdfPath}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download PDF
                      </a>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {expandedImage && (
        <ImageModal
          image={expandedImage}
          onClose={() => {
            setExpandedImage(null)
            return true
          }}
        />
      )}
    </div>
  );
}
