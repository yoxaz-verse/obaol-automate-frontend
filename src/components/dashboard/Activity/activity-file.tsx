"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Input,
  ModalBody,
  Button,
  Card,
  Pagination,
  CardBody,
  Spacer,
} from "@nextui-org/react";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { showToastMessage } from "@/utils/utils";
import { baseUrl } from "@/core/api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QueryComponent from "@/components/queryComponent";
import Image from "next/image";
import { User } from "@/context/AuthContext";

interface ActivityFileCardProps {
  activityId: string;
  user: User | null;
}

const ActivityFileCard: React.FC<ActivityFileCardProps> = ({
  user,
  activityId,
}) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [comments, setComments] = useState("");
  const limit = 10;
  const queryClient = useQueryClient();

  const apiEndpoint = `${baseUrl}/activityFile`;

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${apiEndpoint}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload files.");
      return response.json();
    },
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: "Files uploaded successfully.",
      });
      queryClient.invalidateQueries();
      closeModal();
    },
    onError: () =>
      showToastMessage({ type: "error", message: "Failed to upload files." }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(
        `${apiEndpoint}/${activityId}/file/${fileId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete file.");
      return response.json();
    },
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: "File deleted successfully.",
      });
      queryClient.invalidateQueries();
    },
    onError: () =>
      showToastMessage({ type: "error", message: "Failed to delete file." }),
  });

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  const uppyInstance = React.useRef<Uppy | null>(null);

  useEffect(() => {
    // Initialize Uppy only once
    uppyInstance.current = new Uppy({
      restrictions: {
        maxNumberOfFiles: 10,
        allowedFileTypes: ["image/*", "application/pdf"],
      },
      autoProceed: false,
      debug: true,
    });

    uppyInstance.current.use(XHRUpload, {
      endpoint: `${baseUrl}/activity-files/upload`,
      fieldName: "files",
      formData: true,
      method: "POST",
      bundle: true,
      withCredentials: true,
    });

    // Cleanup Uppy instance on component unmount
    return () => uppyInstance.current?.destroy();
  }, []);

  const handleUpload = () => {
    if (!uppyInstance.current) {
      console.error("Uppy instance is not initialized.");
      return;
    }

    const files = uppyInstance.current.getFiles();
    if (files.length === 0) {
      console.error("No files selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("activityId", activityId); // Add required activity ID
    formData.append("comments", comments); // Add required activity ID

    // Add files to FormData
    files.forEach((file) => {
      formData.append("files", file.data);
    });

    // Trigger the upload mutation
    uploadMutation.mutate(formData);
  };

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between w-full p-4">
          <Button color="primary" onClick={openModal}>
            Add Files
          </Button>
        </div>
        <CardBody className="w-full">
          <QueryComponent
            api={`${apiEndpoint}/${activityId}`}
            queryKey={["activityFiles", activityId]}
            page={page}
            limit={limit}
          >
            {(data: any) => {
              if (!data || !data.files) return <div>No files found.</div>;

              setTotalPages(data?.totalPages || 1);

              // Group files by status
              const groupedFiles: Record<string, any[]> = data.files.reduce(
                (acc: Record<string, any[]>, fileWrapper: any) => {
                  // fileWrapper.append("comments", data.comments);
                  const status = fileWrapper.status || "Unknown";
                  if (!acc[status]) acc[status] = [];
                  acc[status].push(fileWrapper);
                  return acc;
                },
                {}
              );

              console.log("groupedFiles", groupedFiles);
              return (
                <>
                  {Object.entries(groupedFiles).map(
                    ([status, files]: [string, any[]]) => (
                      <div key={status} className="my-4">
                        <h2 className="text-lg font-semibold text-gray-700 capitalize">
                          {status} Files
                        </h2>
                        <div className="border p-2 rounded-lg">
                          {files.map((file) => {
                            const fileUrl = `http://localhost:5001${file.file.url}`;

                            return (
                              <div
                                key={file.file._id}
                                className="flex justify-between items-center border-b p-2"
                              >
                                {/* File Details */}
                                <div className="flex items-center justify-between space-x-4">
                                  {file.file.mimeType.startsWith("image/") ? (
                                    <Image
                                      src={fileUrl}
                                      width={100}
                                      height={100}
                                      alt={file.fileName}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-blue-500 "
                                    >
                                      File Format
                                    </a>
                                  )}
                                  <div className="text-sm text-center  text-gray-500">
                                    {file.comments}
                                  </div>
                                </div>

                                {/* Status Dropdown */}
                                {/* <select
                                  value={status}
                                  onChange={(e) =>
                                    updateStatusMutation.mutate({
                                      fileId: file._id,
                                      newStatus: e.target.value,
                                    })
                                  }
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  <option value="Submitted">Submitted</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
                                </select> */}

                                {/* Download and Delete Buttons */}
                                <div className="flex space-x-2">
                                  <a
                                    href={fileUrl}
                                    download={file.file.fileName}
                                  >
                                    <Button color="success" size="sm">
                                      Download
                                    </Button>
                                  </a>
                                  {user?.role === "Admin" && (
                                    <Button
                                      color="danger"
                                      size="sm"
                                      onClick={() =>
                                        deleteMutation.mutate(file.file._id)
                                      }
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                  <Spacer y={4} />
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={(pageNumber) => setPage(pageNumber)}
                  />
                </>
              );
            }}
          </QueryComponent>
        </CardBody>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalContent>
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody>
            {uppyInstance.current && (
              <Dashboard
                uppy={uppyInstance.current}
                hideUploadButton
                proudlyDisplayPoweredByUppy={false}
              />
            )}
            <textarea
              name={"comments"}
              required
              placeholder={"Comments"}
              onChange={(e) => setComments(e.target.value)}
              className="py-2 border rounded-md w-full"
            />{" "}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" onClick={handleUpload}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ActivityFileCard;
