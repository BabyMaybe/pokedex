import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { spread } from "q";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function LeftPanel(props) {
  const pData = props.pData;
  console.log("left-panel");
  console.log(pData);

  if (typeof pData === "object" && Object.keys(pData).length != 0) {
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
            data.flavor_text_entries
              .filter(e => e.language.name === "en")
              .map(e => e.flavor_text)
          ),
          loading: false
        });
      });
  }

  render() {
    return (
      <div className="pokemon-description screen">{this.state.description}</div>
    );
  }
}

function PokemonSprite(props) {
  return <img src={props.src} alt="pokemon" className="pokemon-sprite" />;
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
    setTimeout(
      () => this.setState({ index: (index + 1) % sprites.length }),
      1000
    );

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
      pokemonIndex: 55,
      pokemonData: {},
      speciesData: {},
      loading: false
    };
    console.log("constructing pokedex");
  }

  componentDidMount() {
    this.setState({ loading: true });
    const request = `${this.state.requestRoot}${this.state.pokemonIndex}/`;
    console.log("requesting");
    fetch(request, {
      cache: "force-cache"
    })
      .then(response => response.json())
      .then(data => {
        console.log("heres what I got");
        this.setState({
          pokemonData: data
        });
        console.log(data);
        const speciesRequest = data.species.url;
        return fetch(speciesRequest);
      })
      .then(response => response.json())
      .then(data => {
        console.log("making second fetch");
        this.setState({
          speciesData: data,
          loading: false
        });
      });
  }

  render() {
    const pData = this.state.pokemonData;
    console.log(this.state);
    return (
      <div className="pokedex">
        <LeftPanel pData={pData} no={this.state.pokemonIndex} />
        <Divider />
        <RightPanel pData={pData} />
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
        <PokemonEvolution />
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

function PokemonEvolution(props) {
  return (
    <div className="panel-row">
      <div className="screen evo" />
      <div className="screen evo" />
      <div className="screen evo" />
    </div>
  );
}

function PokedexControls(props) {
  return (
    <div className="panel-row controls">
      <div className="prev button" />
      <div className="num">#</div>
      <div className="next button" />
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
