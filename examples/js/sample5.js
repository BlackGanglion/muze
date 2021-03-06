const env = muze();
const DataModel = muze.DataModel;

function shuffleArray (array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

d3.json('../../data/cars.json', (data) => {
    const jsonData = data;
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
        numberFormat: val => `$${val}`
    },
    {
        name: 'Origin',
        type: 'dimension',
        displayName: 'Origin2'
    },
    {
        name: 'Cylinders',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension'
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }
    ];

    const rootData = new DataModel(jsonData, schema);

    rootData.sort([
        ['Cylinders', 'asc'],
        ['Maker', 'desc']
    ]);

    let rows = ['Origin', 'Acceleration'],
        columns = rows.reverse();
    const canvas = env.canvas();
    canvas.data(rootData).rows(['Maker']).columns(['Name'])
        // .color('Maker')
        .mount('#chart').height(500);

    setTimeout(() => {
        canvas.data(rootData).rows(['Maker']).columns([]).color('Cylinders')
        .layers([{
            mark: 'arc'

        }]);
        setTimeout(() => {
            canvas.data(rootData).columns(['Maker']).rows(['Cylinders']).layers([{
                mark: 'arc'

            }]).color('Cylinders');
        }, 1000);
    }, 1000);
});
