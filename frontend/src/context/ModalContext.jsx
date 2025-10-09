// src/context/ModalContext.js
import { createContext, useState, useContext } from 'react';
import ActionModal from '../component/ActionModal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    actions: [],
    iconType: null,
  });

  const showModal = ({ title, message, actions, iconType }) => {
    setModalState({ isOpen: true, title, message, actions, iconType });
  };

  const hideModal = () => {
    setModalState({ isOpen: false, title: '', message: '', actions: [], iconType: null });
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <ActionModal 
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        actions={modalState.actions}
        iconType={modalState.iconType}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};