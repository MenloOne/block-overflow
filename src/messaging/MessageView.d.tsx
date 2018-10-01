import React from "react";

declare module 'react' {
    interface HTMLAttributes<T> extends React.DOMAttributes<T> {
        'disabled'?: boolean; // or 'some-value' | 'another-value'
    }
}
