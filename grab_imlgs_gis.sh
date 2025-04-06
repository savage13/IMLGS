#!/bin/bash

API="https://www.ngdc.noaa.gov/geosamples-api/api/"

#curl "${API}/repositories/name?items_per_page=500" > repositories.json
#curl "${API}/platforms?items_per_page=2000" > platforms.json
#curl "${API}/devices?items_per_page=2000" > devices.json
#curl "${API}/cruises/name?items_per_page=2000" > cruises.json
#curl "${API}/cruises/name?items_per_page=2000&page=2" > cruises2.json
#curl "${API}/cruises/name?items_per_page=2000&page=3" > cruises3.json
#curl "${API}/cruises/name?items_per_page=2000&page=4" > cruises4.json
#curl "${API}/lakes?items_per_page=2000" > lakes.json
#curl "${API}/rock_lithologies?items_per_page=2000" > rock_lithologies.json
#curl "${API}/physiographic_provinces?items_per_page=2000" > physiographic_provinces.json
#curl "${API}/lithologic_compositions?items_per_page=2000" > lithologic_compositions.json
#curl "${API}/mineralogies?items_per_page=2000" > mineralogies.json
#curl "${API}/remarks?items_per_page=2000" > remarks.json
#curl "${API}/textures?items_per_page=2000" > textures.json
#curl "${API}/geologic_ages?items_per_page=2000" > geologic_ages.json
#curl "${API}/metamorphism?items_per_page=2000" > metamorphism.json
#curl "${API}/weathering?items_per_page=2000" > weathering.json
#curl "${API}/samples/count" > count.json

COUNT=235669
#COUNT=200000
SIZE=500
N=0

while [[ $N -lt $COUNT ]]; do
    OUTPUT=$(printf "json/imlgs_%06d.json" $N)
    echo $N $OUTPUT
    if [ ! -e $OUTPUT ]; then
        curl "https://gis.ngdc.noaa.gov/arcgis/rest/services/Sample_Index/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&defaultSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=${N}&resultRecordCount=${SIZE}&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&timeReferenceUnknownClient=false&maxRecordCountFactor=&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson" > $OUTPUT
    fi
    N=$(($N + $SIZE))
done


