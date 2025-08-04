cd assets/
for i in *.png *.jpg; do
    prefix="${i%.*}"
    # if the file already exists, skip it
    if [ ! -f ../assets/$prefix.jpg ]; then
        echo "Converting $i to $prefix.jpg"
        convert -flatten -strip -interlace  Plane -quality 80 $i ../assets/$prefix.jpg
        rm $i
    fi
done
