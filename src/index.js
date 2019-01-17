import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const POKEMON = 1;

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function LeftPanel(props) {
    const pData = props.pData;

    if (typeof pData === "object" && Object.keys(pData).length !== 0) {
        return (
            <div className="panel left-panel">
                <PokemonName name={pData.name} no={props.no} />
                <PokemonSprite src={pData.sprites.front_default} />
                {/* <PokemonSpriteAnimated sprites={pData.sprites} /> */}
                <PokemonDescription no={props.no} />
            </div>
        );
    } else {
        return Loading();
    }
}

function PokemonName(props) {
    return (
        <div className="pokemon-name screen">
            {props.name}
            <span className="name-no">no. {props.no}</span>
        </div>
    );
}

class PokemonDescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            no: props.no,
            description: ""
        };
    }

    componentDidMount() {
        this.setState({ loading: true });
        let request = `https://pokeapi.co/api/v2/pokemon-species/${this.state.no}/`;
        fetch(request)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    description: pickRandom(
                        data.flavor_text_entries.filter(e => e.language.name === "en").map(e => e.flavor_text)
                    ),
                    loading: false
                });
            });
    }

    render() {
        return <div className="pokemon-description screen">{this.state.description}</div>;
    }
}

function PokemonSprite(props) {
    return <img src={props.src} alt="pokemon" className="pokemon-sprite" />;
}

function PokemonSpriteSmall(props) {
    return <img src={props.src} alt="pokemon" className="pokemon-sprite pokemon-sprite-small" />;
}

class PokemonSpriteAnimated extends React.Component {
    constructor(props) {
        super(props);

        const sprites = Object.keys(props.sprites)
            .map(sprite => props.sprites[sprite])
            .filter(url => url);

        this.state = {
            sprites: sprites,
            index: 0
        };
    }

    render() {
        const index = this.state.index;
        const sprites = this.state.sprites;
        setTimeout(() => this.setState({ index: (index + 1) % sprites.length }), 1000);

        return <PokemonSprite src={sprites[index]} />;
    }
}

function Divider(props) {
    return (
        <div className="divider">
            <div className="gap" />
            <div className="hinge" />
            <div className="gap" />
            <div className="hinge" />
            <div className="gap" />
            <div className="hinge" />
            <div className="gap" />
        </div>
    );
}

class Pokedex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            requestRoot: "https://pokeapi.co/api/v2/pokemon/",
            pokemonIndex: POKEMON,
            pokemonData: {},
            speciesData: {},
            evoSprites: [],
            loading: false
        };
    }

    componentDidMount() {
        this.setState({ loading: true });
        const request = `${this.state.requestRoot}${this.state.pokemonIndex}/`;

        fetch(request, {
            cache: "force-cache"
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    pokemonData: data
                });

                const speciesRequest = data.species.url;
                return fetch(speciesRequest);
            })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    speciesData: data,
                    loading: false
                });
                const evo_chain = data.evolution_chain.url;

                fetch(evo_chain)
                    .then(response => response.json())
                    .then(data => {
                        const api = "https://pokeapi.co/api/v2/pokemon/";
                        const e1 = fetch(`${api}${data.chain.species.name}/`);
                        const e2 = fetch(`${api}${data.chain.evolves_to[0].species.name}/`);
                        const e3 = fetch(`${api}${data.chain.evolves_to[0].evolves_to[0].species.name}/`);

                        Promise.all([e1, e2, e3])
                            .then(responses => Promise.all(responses.map(value => value.json())))
                            .then(dataList => {
                                const sprites = dataList.map(v => v.sprites.front_default);
                                this.setState({ evoSprites: sprites });
                            });
                    });
            });
    }

    render() {
        const pData = this.state.pokemonData;
        const sData = this.state.speciesData;

        return (
            <div className="pokedex">
                <LeftPanel pData={pData} sData={sData} no={this.state.pokemonIndex} />
                <Divider />
                <RightPanel pData={pData} sData={sData} evoSprites={this.state.evoSprites} />
                {/* <TypeList /> */}
            </div>
        );
    }
}

function RightPanel(props) {
    const types = props.pData.types;
    const stats = props.pData.stats;

    if (types) {
        return (
            <div className="panel right-panel">
                <div className="panel-row">
                    <PokemonStats stats={stats} />
                    <PokemonType types={types} />
                </div>

                <PokemonEvolution evoSprites={props.evoSprites} />
                <PokedexControls />
            </div>
        );
    } else {
        return Loading();
    }
}

function PokemonType(props) {
    const types = props.types;
    return (
        <div className="type-list">
            <div className="panel-header">Types</div>
            <div className="type-box">
                {types.map(t => {
                    const type = t.type.name;
                    return <Type type={type} key={type} />;
                })}
            </div>
        </div>
    );
}

function PokemonStats(props) {
    const stats = props.stats;
    return (
        <div className="screen stats">
            {stats.map(s => {
                const name = s.stat.name;
                const value = s.base_stat;

                return <StatLine name={name} value={value} key={name} />;
            })}
        </div>
    );
}

function StatLine(props) {
    return (
        <div className="stat-line">
            <span>{props.name}</span>
            {".".repeat(20 - props.name.length)}
            <span>{props.value}</span>
        </div>
    );
}

function PokemonEvolution(props) {
    const e1 = props.evoSprites[0];
    const e2 = props.evoSprites[1];
    const e3 = props.evoSprites[2];

    return (
        <div className="panel-row panel-evo">
            <div className="panel-header evo-header">Evolutions</div>
            <PokemonSpriteSmall src={e1} />
            <PokemonSpriteSmall src={e2} />
            <PokemonSpriteSmall src={e3} />
        </div>
    );
}

function PokedexControls(props) {
    return (
        <div className="panel-row controls">
            {/* <div className="prev button" />
            <div className="num">#</div>
            <div className="next button" /> */}

            <Button dir="left" />
            <Button dir="right" />
        </div>
    );
}

function Button(props) {
    return <div className="button">{/* <i className={"fas fa-angle-" + props.dir} /> */}</div>;
}

function Loading() {
    return <h1>LOADING...</h1>;
}

function Type(props) {
    return <div className={"type " + props.type}>{props.type}</div>;
}

ReactDOM.render(<Pokedex />, document.getElementById("root"));

// class TypeList extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             loading: false,
//             data: []
//         };
//     }

//     componentDidMount() {
//         this.setState({ loading: true });

//         let request = "https://pokeapi.co/api/v2/type/";

//         fetch(request)
//             .then(response => response.json())
//             .then(data => this.setState({ data: data.results, loading: false }));
//     }

//     render() {
//         return (
//             <div className="type-list">
//                 {this.state.loading ? (
//                     <Loading />
//                 ) : (
//                     this.state.data.map(d => {
//                         return <Type type={d.name} key={d.name} />;
//                     })
//                 )}
//             </div>
//         );
//     }
// }
