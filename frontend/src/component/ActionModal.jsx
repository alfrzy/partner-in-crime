// src/component/ActionModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';

// Map untuk ikon berdasarkan tipe modal
const icons = {
  success: <FaCheckCircle className="text-green-500 text-5xl" />,
  warning: <FaExclamationTriangle className="text-red-500 text-5xl" />,
  logout: <FaSignOutAlt className="text-gray-500 text-5xl" />,
};

function ActionModal({ isOpen, onClose, title, message, actions = [], iconType }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center"
          >
            {iconType && <div className="mb-4 flex justify-center">{icons[iconType]}</div>}
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="flex justify-center gap-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-6 py-2 rounded-lg font-semibold transition-transform transform active:scale-95 ${
                    action.className || 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ActionModal;