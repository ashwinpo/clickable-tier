import React, { useState, useEffect, useRef, useContext } from "react";
import { ReactSortable } from "react-sortablejs";
import { SketchPicker } from "react-color";
import { TierContext } from "../App";
import Image from "./Image";

interface ImageItem {
    id: number;
    url: string;
    linkUrl?: string;
    notes?: string;  // Added notes property
}

interface TierProps {
    color: string;
    name: string;
    onDelete: () => void;
}

const Tier: React.FC<TierProps> = ({ color, name, onDelete }) => {
    const [images, setImages] = useState<ImageItem[]>(() => {
        const storedImages = localStorage.getItem(`tierImages_${color}_${name}`);
        return storedImages ? JSON.parse(storedImages) : [];
    });

    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({
        left: 0,
        top: 0
    });

    const { tiers, setTiers } = useContext(TierContext) || {};
    const contextMenuRef = useRef<HTMLDivElement>(null);

    const tierIndex = tiers.findIndex((tier) => tier.color === color && tier.id === name);
    const editedColor = tierIndex !== -1 ? tiers[tierIndex].color : color;
    const editedName = tierIndex !== -1 ? tiers[tierIndex].id : name;

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                isContextMenuOpen &&
                contextMenuRef.current &&
                !contextMenuRef.current.contains(e.target as Node)
            ) {
                handleCloseContextMenu();
            }
        };

        window.addEventListener("click", handleOutsideClick);

        return () => {
            window.removeEventListener("click", handleOutsideClick);
        };
    }, [isContextMenuOpen]);

    useEffect(() => {
        localStorage.setItem(
            `tierImages_${color}_${name}`,
            JSON.stringify(images)
        );
    }, [images, color, name]);

    const handleColorChange = (newColor: any) => {
        if (tierIndex !== -1) {
            const updatedTiers = [...tiers];
            updatedTiers[tierIndex].color = newColor.hex;
            setTiers(updatedTiers);
        }
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (tierIndex !== -1) {
            const updatedTiers = [...tiers];
            updatedTiers[tierIndex].id = event.target.value;
            setTiers(updatedTiers);
        }
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsContextMenuOpen(true);
        setContextMenuPosition({ left: e.clientX, top: e.clientY });
    };

    const handleCloseContextMenu = () => {
        setIsContextMenuOpen(false);
    };

    const handleDeleteTier = () => {
        onDelete();
        handleCloseContextMenu();
    };

    const updateImageLink = (imageId: number, newLinkUrl: string) => {
        setImages(prevImages => 
            prevImages.map(img => 
                img.id === imageId 
                    ? { ...img, linkUrl: newLinkUrl }
                    : img
            )
        );
    };

    const updateImageNotes = (imageId: number, newNotes: string) => {
        setImages(prevImages => 
            prevImages.map(img => 
                img.id === imageId 
                    ? { ...img, notes: newNotes }
                    : img
            )
        );
    };

    return (
        <div className="flex bg-[#1A1A17] gap-[2px]">
            <div
                onContextMenu={handleContextMenu}
                className={`w-24 min-h-[5rem] flex justify-center items-center handle cursor-move`}
                style={{ backgroundColor: editedColor }}
            >
                <p className="text-center" style={{ overflowWrap: "anywhere" }}>
                    {editedName}
                </p>
            </div>
            <ReactSortable
                list={images}
                setList={setImages}
                tag="div"
                group="shared"
                className="react-sortablejs flex space-x-[2px] flex-1 flex-wrap"
            >
                {images.map((image) => (
                    <div key={image.id} className="relative">
                        <Image
                            imageUrl={image.url}
                            linkUrl={image.linkUrl}
                            notes={image.notes}
                            onNotesChange={(newNotes) => updateImageNotes(image.id, newNotes)}
                            onDelete={() => {
                                const updatedImages = images.filter(
                                    (img) => img.id !== image.id
                                );
                                setImages(updatedImages);
                            }}
                        />
                        <button
                            onClick={() => {
                                const newUrl = prompt("Enter URL for this image:", image.linkUrl);
                                if (newUrl !== null) {
                                    updateImageLink(image.id, newUrl);
                                }
                            }}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-tl text-xs opacity-60 hover:opacity-100"
                        >
                            🔗
                        </button>
                    </div>
                ))}
            </ReactSortable>

            {isContextMenuOpen && (
                <div
                    ref={contextMenuRef}
                    className="fixed bg-zinc-800 text-white p-2 rounded-md shadow-2xl z-10"
                    style={{
                        left: contextMenuPosition.left,
                        top: contextMenuPosition.top
                    }}
                    id="context-menu"
                >
                    <div>
                        <label className="block text-gray-300 font-semibold">
                            Edit Color
                        </label>
                        <SketchPicker
                            color={editedColor}
                            onChange={handleColorChange}
                            disableAlpha
                            presetColors={[
                                "#FF7F7F",
                                "#FFBF7F",
                                "#FFDF80",
                                "#FFFF7F",
                                "#BFFF7F",
                                "#7FFF7F"
                            ]}
                            className="text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold">
                            Edit Name
                        </label>
                        <input
                            type="text"
                            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-300 text-black"
                            value={editedName}
                            onChange={handleNameChange}
                        />
                    </div>
                    <div>
                        <span
                            className="text-red-500 cursor-pointer"
                            onClick={handleDeleteTier}
                        >
                            Delete Tier
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tier;