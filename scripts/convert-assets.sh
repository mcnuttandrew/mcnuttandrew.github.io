rm -rf public/converted-images
mkdir public/converted-images
cd public/assets/
for i in *.png *.jpg; do
    prefix="${i%.*}"
    convert -flatten -strip -interlace  Plane -quality 80 $i ../converted-images/$prefix.jpg
done
