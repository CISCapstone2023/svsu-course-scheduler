import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "react-daisyui";

interface ConfirmDeleteModalProps {
  children?: React.ReactNode;
  title: string;
  message: string;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteModal = ({
  open,
  onConfirm,
  onClose,
  title,
  message,
}: ConfirmDeleteModalProps) => {
  return (
    <Modal open={open} onClickBackdrop={onClose}>
      <Button
        size="sm"
        shape="circle"
        className="absolute right-2 top-2"
        onClick={onClose}
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
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              color="success"
              type="submit"
              className="mt-2"
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDeleteModal;
