// Fetch the datasets
Promise.all([
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'),
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'),
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json')
])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(datasets => {
        const kickstarterData = datasets[0];
        const movieData = datasets[1];
        const videoGameData = datasets[2];

        // Create the Treemap Diagram
        const svg = d3.select('body')
            .append('svg')
            .attr('width', 800)
            .attr('height', 600);

        // Add title
        svg.append('text')
            .attr('id', 'title')
            .text('Treemap Diagram');

        // Add description
        svg.append('text')
            .attr('id', 'description')
            .text('A visualization of data using a treemap diagram.');

        // Add rect elements representing the data
        const treemap = d3.treemap()
            .size([800, 600])
            .padding(1);

        const root = d3.hierarchy(kickstarterData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        treemap(root);

        const colorScale = d3.scaleOrdinal()
            .domain(root.leaves().map(d => d.data.category))
            .range(['steelblue', 'orange']); // Add more colors here if needed

        svg.selectAll('.tile')
            .data(root.leaves())
            .enter()
            .append('rect')
            .attr('class', 'tile')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => colorScale(d.data.category))
            .attr('data-name', d => d.data.name)
            .attr('data-category', d => d.data.category)
            .attr('data-value', d => d.data.value)
            .on('mouseover', (event, d) => {
                const tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .attr('data-value', d.data.value)
                    .style('position', 'absolute')
                    .style('left', event.pageX + 'px')
                    .style('top', event.pageY + 'px')
                    .style('opacity', 0.9)
                    .style('background-color', 'white')
                    .style('padding', '10px')
                    .style('border', '1px solid black');

                tooltip.html(`
                    <p>Name: ${d.data.name}</p>
                    <p>Category: ${d.data.category}</p>
                    <p>Value: ${d.data.value}</p>
                `);
            })
            .on('mouseout', () => {
                d3.select('#tooltip').remove();
            });

        // Add legend
        const legend = svg.append('g')
            .attr('id', 'legend');

        const legendData = root.leaves().map(d => d.data.category);
        const uniqueCategories = [...new Set(legendData)];

        const legendItems = legend.selectAll('.legend-item')
            .data(uniqueCategories)
            .enter()
            .append('rect')
            .attr('class', 'legend-item')
            .attr('x', 600)
            .attr('y', (d, i) => 20 * i)
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', d => colorScale(d));

    })
    .catch(error => console.error(error));
