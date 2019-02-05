/* global d3, muze */
d3.json('../data/cars.json', (data) => {
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
        type: 'measure'
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
        type: 'measure'
    },
    {
        name: 'Origin',
        type: 'dimension'
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
    }
    ];

    const DataModel = muze.DataModel;
    const rootData = new DataModel(data, schema);

    const env = muze();
    const canvas = env.canvas();

    canvas
        .rows(['Acceleration']) // Acceleration goes in y axis
        .columns(['Maker']) // Maker goes in x-axis
        .color({
            field: 'Origin'
        })
        .data(rootData)
        .layers({ // Draw a bar plot, by default stack transform is used
            Acceleration: {
                mark: 'bar'
            }
        })
        .config({
            legend: {
                position: 'bottom'
            }
        })
        .width(600)
        .height(500)
        .title('Stacked bar chart', { position: 'top', align: 'right' })
        .subtitle('Cars comparison based Upon Acceleration', { position: 'top', align: 'right' })
        .mount('#chart'); // Set the chart mount point

    setTimeout(() => {
        canvas.title('Updated Stacked Bar Chart')
        .subtitle('Axis Changed')
        .height(700)
        .width(600)
        .color('')
        .rows(['Maker']) // Maker goes in y axis
        .columns(['Acceleration']) // Acceleration goes in x-axis
        .config({
            legend: {
                position: 'bottom'
            }
        });
    }, 3000);
});
