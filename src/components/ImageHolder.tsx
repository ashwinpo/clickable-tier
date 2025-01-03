import { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";
import SettingsModal from "./SettingsModal";
import Image from "./Image";

interface ImageItem {
    id: number;
    url: string;
    linkUrl?: string;  // Optional URL for making the image clickable
}

// Modified ImageHolder.tsx
const ImageHolder = () => {
    const [images, setImages] = useState<ImageItem[]>(() => {
        const storedImages = localStorage.getItem("imageHolder");
        return storedImages ? JSON.parse(storedImages) : [];
    });

	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const compressAndDownscaleImage = (base64: string, maxHeight: number, quality: number): Promise<string> => {
		return new Promise((resolve) => {
			const img = document.createElement("img");
          	img.src = base64;
          	img.onload = function () {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				const maxHeight = 5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
				const scale = maxHeight / img.height;
				canvas.width = img.width * scale;
				canvas.height = maxHeight;
				ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
				const compressedImageData = canvas.toDataURL("image/jpeg", quality);
				resolve(compressedImageData);
		  	};
		});
	  };

	  const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer == null) return;
        if (event.dataTransfer.getData("application/x-tier") !== "true") {
            if (event.dataTransfer.files.length > 0) {
                const time = new Date().getTime();
                const files = Array.from(event.dataTransfer.files);
                files.forEach((file, index) => {
                    if (!file.type.startsWith("image/")) return;
                    const reader = new FileReader();
                    reader.onload = async function (event) {
                        if (event.target == null) return;
                        const imageData = event.target.result;
                        const compressedImageData = await compressAndDownscaleImage(imageData as string, 80, 1);
                        setImages((prevImages) => [
                            ...prevImages,
                            {
                                id: time + index,
                                url: compressedImageData as string,
                                linkUrl: ''  // Initialize with empty link
                            }
                        ]);
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    };

	const dragStart = (event: DragEvent) => {
		if (event.dataTransfer == null) return;
		event.dataTransfer.setData("application/x-tier", "true");
	};

	useEffect(() => {
		const handlePaste = (event: ClipboardEvent) => {
			const items = event.clipboardData?.items;
			if (items) {
				const time = new Date().getTime();
				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					if (item.type.indexOf("image") !== -1) {
						const blob = item.getAsFile();
						let reader = new FileReader();
						reader.readAsDataURL(blob || new Blob()); 
						reader.onloadend = async function() {
							let base64data : any = reader.result;
							const compressedImageData = await compressAndDownscaleImage(base64data as string, 80, 1);
							setImages((prevImages) => [
								...prevImages,
								{ id: time + i, url: compressedImageData }
							]);
						}
					}
				}
			}
		};

		document.addEventListener("paste", handlePaste);

		const dragOver = (event: DragEvent) => {
			event.preventDefault();
		};

		const drop = (event: DragEvent) => {
			event.preventDefault();
			handleDrop(event);
		};

		document.addEventListener("dragstart", dragStart);
		document.addEventListener("dragover", dragOver);
		document.addEventListener("drop", drop);

		return () => {
			document.removeEventListener("paste", handlePaste);
			document.removeEventListener("dragover", dragOver);
			document.removeEventListener("drop", drop);
		};
	}, []);

	useEffect(() => {
		try{
			localStorage.setItem("imageHolder", JSON.stringify(images));
		} catch (error) {
			window.alert("Local storage is full :(");
		}
	}, [images]);

	// Add function to handle link updates
    const updateImageLink = (imageId: number, newLinkUrl: string) => {
        setImages(prevImages => 
            prevImages.map(img => 
                img.id === imageId 
                    ? { ...img, linkUrl: newLinkUrl }
                    : img
            )
        );
    };

    // In the return statement, modify the Image component usage:
    return (
        <div className="bg-stone-700 flex mt-8">
            <ReactSortable
                list={images}
                setList={setImages}
                tag="div"
                group="shared"
                className="react-sortablejs flex space-x-4 p-4 min-h-[7rem] flex-wrap flex-1 items-center"
                filter=".ignore-elements"
            >
                {images.length === 0 ? (
                    <p className="text-gray-400 text-center w-full ignore-elements">
                        Drag & Drop or Copy and Paste images in here!
                    </p>
                ) : (
                    images.map((image) => (
                        <div key={image.id} className="relative">
                            <Image
                                imageUrl={image.url}
                                linkUrl={image.linkUrl}
                                onDelete={() => {
                                    const updatedImages = images.filter(
                                        (img) => img.id !== image.id
                                    );
                                    setImages(updatedImages);
                                }}
                            />
                            {/* Add a button to edit link */}
                            <button
                                onClick={() => {
                                    const newUrl = prompt("Enter URL for this image:", image.linkUrl);
                                    if (newUrl !== null) {
                                        updateImageLink(image.id, newUrl);
                                    }
                                }}
                                className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-tl text-xs"
                            >
                                🔗
                            </button>
                        </div>
                    ))
                )}
            </ReactSortable>
        </div>
    );
};

export default ImageHolder;
