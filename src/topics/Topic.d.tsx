import React from "react";

declare module 'react' {
    interface HTMLAttributes<T> extends React.DOMAttributes<T> {
        'negative'?: string; // or 'some-value' | 'another-value'
    }
}
