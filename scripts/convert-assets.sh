rm -rf converted-images
mkdir converted-images
cd assets/
for i in *.png *.jpg; do
    prefix="${i%.*}"
    convert -strip -interlace Plane -quality 80 $i ../converted-images/$prefix.jpg
done
