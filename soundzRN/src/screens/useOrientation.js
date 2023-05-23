// useOrientation.tsx
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};

export function useOrientation() {

    const [orientation, setOrientation] = useState(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

    useEffect(() => {
        const callback = () => setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

        Dimensions.addEventListener('change', callback);

        return () => {
            Dimensions.removeEventListener('change', callback);
        };
    }, []);

    return orientation;
}