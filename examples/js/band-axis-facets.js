/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

d3.json('../../data/cars.json', (data) => {
    let jsonData = data;
    const schema = [{
        name: 'Name',
        type: 'dimension'
    },
    {
        name: 'Maker',
        type: 'dimension'
    },
    {
        name: 'Miles_per_Gallon',
        type: 'measure'
    },

    {
        name: 'Displacement',
        type: 'measure',
        defAggFn: 'min'
    },
    {
        name: 'Horsepower',
        type: 'measure'
    },
    {
        name: 'Weight_in_lbs',
        type: 'measure'
    },
    {
        name: 'Acceleration',
        type: 'measure',
        numberFormat: (val) => "$" + val
    },
    {
        name: 'Origin',
        type: 'dimension',
        displayName: "Origin2"
    },
    {
        name: 'Cylinders',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }];

    window.rootData = new DataModel(jsonData, schema)

    const rows = ['Origin'];
    const columns = rows.reverse();

    const canvas = env
        .canvas()
        .columns(['Maker', 'Cylinders', 'Acceleration'])
        .rows(columns)
        .data(rootData)
        .height(800)
        .width(1500)
        .detail(['Maker', 'Cylinders'])
        .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' })
        .color({ field: 'Origin' })
        .mount('#chart')
        .config({
            sort:{
                Maker: 'desc',
                Cylinders: (a, b) => a - b,
                Origin: (a, b) => b.localeCompare(a)
            }
        })
});