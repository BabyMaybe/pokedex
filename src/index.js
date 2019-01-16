import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function LeftPanel(props) {
    const data = props.data;

    if (Object.keys(data).length !== 0) {
        return (
            <div className="panel left-panel">
                <PokemonName name={data.name} />
                <PokemonSprite src={data.sprites.front_default} />
                <PokemonDescription no={props.no} />
            </div>
        );
    } else {
        return Loading();
    }
}

function PokemonName(props) {
    return <div className="pokemon-name screen">{props.name}</div>;
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
            pokemonIndex: 83,
            data: {},
            loading: false
        };
    }

    componentDidMount() {
        this.setState({ loading: true });
        let request = `${this.state.requestRoot}${this.state.pokemonIndex}/`;
        fetch(request)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    data: data,
                    loading: false
                });
            });
    }

    render() {
        const data = this.state.data;
        return (
            <div className="pokedex">
                <LeftPanel data={data} no={this.state.pokemonIndex} />
                <Divider />
                <RightPanel data={data} />
                {/* <TypeList /> */}
            </div>
        );
    }
}

function RightPanel(props) {
    const types = props.data.types;
    const stats = props.data.stats;

    if (types) {
        return (
            <div className="panel right-panel">
                <div className="panel-row">
                    <PokemonStats stats={stats} />
                    <PokemonType types={types} />
                </div>
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
            <div className="type-header">Types</div>
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
