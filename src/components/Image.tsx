import React, { useState, useContext } from "react";
import { StylingContext } from "../App";

interface ImageWithContextMenuProps {
    imageUrl: string;
    onDelete: () => void;
    linkUrl?: string;
    notes?: string;
    openInNewTab?: boolean;
    onNotesChange?: (notes: string) => void;
}

const ImageWithContextMenu: React.FC<ImageWithContextMenuProps> = ({
    imageUrl,
    onDelete,
    linkUrl,
    notes = "",
    openInNewTab = true,
    onNotesChange
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { style } = useContext(StylingContext) || {};
    const [showNotes, setShowNotes] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (!showNotes) {
            setShowNotes(false);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (linkUrl && !e.defaultPrevented) {
            window.open(linkUrl, openInNewTab ? '_blank' : '_self');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
    };

    const handleNotesClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowNotes(!showNotes);
    };

    return (
        <div
            className={`relative group ${linkUrl ? 'cursor-pointer' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <img src={imageUrl} className={style} alt="" />
            
            {/* Delete button */}
            {isHovered && (
                <div
                    className="absolute top-0 right-0 p-1 cursor-pointer text-red-500"
                    onClick={handleDeleteClick}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )}

            {/* Notes button */}
            <button
                onClick={handleNotesClick}
                className="absolute bottom-0 left-0 bg-green-500 text-white p-1 rounded-tr text-xs opacity-60 hover:opacity-100"
                title={notes ? notes : "Add notes"}
            >
                📝
            </button>

            {/* Notes popup */}
            {showNotes && (
                <div 
                    className="absolute bottom-full left-0 p-2 bg-black bg-opacity-75 rounded-md mb-2 z-10"
                    onClick={e => e.stopPropagation()}
                >
                    <textarea
                        value={notes}
                        onChange={(e) => onNotesChange?.(e.target.value)}
                        className="w-48 h-24 p-1 text-sm text-black rounded"
                        placeholder="Add notes..."
                    />
                </div>
            )}
        </div>
    );
};

export default ImageWithContextMenu;