import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "react-daisyui";

interface ConfirmDeleteModalProps {
  children?: React.ReactNode;
  title: string;
  message: string;
  open: boolean;
  onConfirmDelete: () => void;
}

const ConfirmDeleteModal = ({
  children,
  open,
  onConfirmDelete,
  title,
  message,
}: ConfirmDeleteModalProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  return (
    <Modal open={modalOpen} onClickBackdrop={toggleModal}>
      <Button
        size="sm"
        shape="circle"
        className="absolute right-2 top-2"
        onClick={toggleModal}
      >
        ✕
      </Button>
      <Modal.Header className="font-bold">{title}</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col">
          <div>
            <p className="text-xl">{message}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              color="error"
              type="submit"
              className="mt-2 mr-2"
              onClick={toggleModal}
            >
              Cancel
            </Button>
            <Button color="success" type="submit" className="mt-2">
              Confirm
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDeleteModal;
