import React from 'react';

interface ContextProps {
    onClose: () => void;
}

const HomeContext = React.createContext<ContextProps>({
    onClose: () => {},
});

export default HomeContext;
