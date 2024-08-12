window.onload = function () {
    const draggables = document.querySelectorAll('.draggable');
    const dropZone = document.getElementById('dropZone');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let offsetX, offsetY;

    // Setup drag start for draggable images
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
    });

    function dragStart(e) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    // Prevent default behavior on dragover
    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    // Handle drop action
    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(id);

        // Calculate drop position
        const rect = dropZone.getBoundingClientRect();
        const dropX = e.clientX - rect.left - offsetX;
        const dropY = e.clientY - rect.top - offsetY;

        // Move the dragged element to the drop position
        draggedElement.style.position = "absolute";
        draggedElement.style.left = `${dropX}px`;
        draggedElement.style.top = `${dropY}px`;

        // Append element to dropZone to keep it inside
        dropZone.appendChild(draggedElement);
    });

    // Draw the contents of the dropZone on the canvas
    function drawDropZoneOnCanvas(callback) {
        const dropZoneRect = dropZone.getBoundingClientRect();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imagesInDropZone = dropZone.querySelectorAll('img.draggable');

        if (imagesInDropZone.length === 0) {
            alert("No images in the drop zone to render.");
            return;
        }

        let imagesLoaded = 0;

        imagesInDropZone.forEach(draggable => {
            const rect = draggable.getBoundingClientRect();
            const x = rect.left - dropZoneRect.left;
            const y = rect.top - dropZoneRect.top;

            const img = new Image();
            img.crossOrigin = "Anonymous"; // This line enables cross-origin images
            img.src = draggable.src;

            img.onload = function () {
                ctx.drawImage(img, x, y, draggable.clientWidth, draggable.clientHeight);
                imagesLoaded++;

                // Call the callback after all images are drawn
                if (imagesLoaded === imagesInDropZone.length) {
                    callback();
                }
            };

            img.onerror = function () {
                console.error(`Failed to load image: ${img.src}`);
            };
        });
    }

    // Handle download image functionality
    function downloadImage(format) {
        drawDropZoneOnCanvas(() => {
            const link = document.createElement('a');
            link.download = `dropped_image.${format}`;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
        });
    }

    // Attach event listeners to download buttons
    document.getElementById('downloadPng').addEventListener('click', function () {
        console.log('PNG button clicked');
        downloadImage('png');
    });

    document.getElementById('downloadJpeg').addEventListener('click', function () {
        console.log('JPEG button clicked');
        downloadImage('jpeg');
    });
};
