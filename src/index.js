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
        {/* <PokemonSprite src={pData.sprites.front_shiny} /> */}
        {/* <PokemonSpriteAnimated sprites={pData.sprites} /> */}
        <PokemonDescription description={props.description} no={props.no} />
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

function PokemonDescription(props) {
  return <div className="pokemon-description screen">{props.description}</div>;
}

function PokemonSprite(props) {
  return <img src={props.src} alt="pokemon" className="pokemon-sprite" />;
}

// class PokemonSpriteAnimated extends React.Component {
//     constructor(props) {
//         super(props);

//         const sprites = Object.keys(props.sprites)
//             .map(sprite => props.sprites[sprite])
//             .filter(url => url);

//         this.state = {
//             sprites: sprites,
//             index: 0
//         };
//     }

//     render() {
//         const index = this.state.index;
//         const sprites = this.state.sprites;
//         setTimeout(() => this.setState({ index: (index + 1) % sprites.length }), 1000);

//         return <PokemonSprite src={sprites[index]} />;
//     }
// }

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
      pokemonDescription: "",
      speciesData: {},
      evoSprites: [],
      evoNames: [],
      moves: [],
      loading: false
    };
    this.nextPokemon = this.nextPokemon.bind(this);
    this.previousPokemon = this.previousPokemon.bind(this);
  }

  nextPokemon() {
    const next = this.state.pokemonIndex + 1;
    this.setState({ pokemonIndex: next }, this.changePokemon);
  }

  previousPokemon() {
    const prev = this.state.pokemonIndex - 1;
    this.setState({ pokemonIndex: prev }, this.changePokemon);
  }

  componentDidMount() {
    this.changePokemon();
  }

  changePokemon() {
    this.setState({ loading: true });
    const request = `${this.state.requestRoot}${this.state.pokemonIndex}/`;
    fetch(request, {
      cache: "force-cache"
    })
      .then(response => response.json())
      .then(data => {
        this.setState({
          pokemonData: data,
          pokemonIndex: data.id
        });
        const speciesRequest = data.species.url;
        return fetch(speciesRequest);
      })
      .then(response => response.json())
      .then(data => {
        this.setState({
          speciesData: data,

          description: pickRandom(
            data.flavor_text_entries
              .filter(e => e.language.name === "en")
              .map(e => e.flavor_text)
          ),

          loading: false
        });
        const evo_chain = data.evolution_chain.url;
        fetch(evo_chain)
          .then(response => response.json())
          .then(data => {
            const api = "https://pokeapi.co/api/v2/pokemon/";
            const first = data.chain;
            const second = first.evolves_to[0];
            const third = second.evolves_to[0];
            let evos = [];
            if (first) {
              const e1 = fetch(`${api}${first.species.name}/`);
              evos.push(e1);
            }
            if (second) {
              const e2 = fetch(`${api}${second.species.name}/`);
              evos.push(e2);
            }
            if (third) {
              const e3 = fetch(`${api}${third.species.name}/`);
              evos.push(e3);
            }
            Promise.all(evos)
              .then(responses =>
                Promise.all(responses.map(value => value.json()))
              )
              .then(dataList => {
                const sprites = dataList.map(v => v.sprites.front_default);
                const names = dataList.map(n => n.name);
                this.setState({ evoSprites: sprites, evoNames: names });
              });
          });
      });
  }

  render() {
    const pData = this.state.pokemonData;
    const sData = this.state.speciesData;

    return (
      <div className="pokedex">
        <LeftPanel
          pData={pData}
          sData={sData}
          no={this.state.pokemonIndex}
          description={this.state.description}
        />
        <Divider />
        <RightPanel
          pData={pData}
          sData={sData}
          evoSprites={this.state.evoSprites}
          evoNames={this.state.evoNames}
          controls={{ next: this.nextPokemon, prev: this.previousPokemon }}
        />
        {/* <TypeList /> */}
      </div>
    );
  }
}

function RightPanel(props) {
  const types = props.pData.types;
  const stats = props.pData.stats;
  const moves = props.pData.moves;

  if (types) {
    return (
      <div className="panel right-panel">
        <div className="panel-row">
          <PokemonStats stats={stats} />
          <PokemonType types={types} />
        </div>

        <PokemonEvolution
          evoSprites={props.evoSprites}
          evoNames={props.evoNames}
        />
        <MoveList moves={moves} />
        <PokedexControls controls={props.controls} />
      </div>
    );
  } else {
    return Loading();
  }
}

class MoveList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      moves: props.moves,
      index: 0,
      currentMove: {},
      loading: false
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    fetch(this.state.moves[this.state.index].move.url)
      .then(response => response.json())
      .then(data => {
        this.setState({ currentMove: data, loading: false });
      });
  }

  render() {
    let moves;

    if (
      this.state.loading ||
      Object.keys(this.state.currentMove).length === 0
    ) {
      moves = <Loading />;
    } else {
      const lvl = this.state.moves[this.state.index].version_group_details[0]
        .level_learned_at;
      moves = <MoveEntry move={this.state.currentMove} lvl={lvl} />;
    }

    return (
      <div className="move-list">
        {moves}
        <div className="move-controls">
          <div className="move-arrow">
            <i className="fas fa-caret-up" />
          </div>
          <div className="move-arrow">
            <i className="fas fa-caret-down" />
          </div>
        </div>
      </div>
    );
  }
}

function padStats(stat, val, sep, len) {
  //   console.log("val: ", val, "len: ", val.toString().length);
  //   console.log("stat: ", stat, "len: ", stat.toString().length);
  //   console.log("sep: ", sep, "len: ", len);
  //   console.log(
  //     "len - val + stat: ",
  //     len - (val.toString().length + stat.toString().length)
  //   );
  //   console.log(
  //     "repeat: ",
  //     sep.repeat(len - (val.toString().length + stat.toString().length))
  //   );
  //   debugger;
  let output = `
    ${stat.toString()}${sep.repeat(
    len - (val.toString().length + stat.toString().length)
  )}${val.toString()}`;
  return output;
}

function MoveEntry(props) {
  const move = props.move;
  const name = move.names.filter(m => m.language.name === "en")[0].name;
  const acc = move.accuracy;
  const pow = move.power;
  const pp = move.pp;
  const type = move.type.name;
  //   const status = "" || "---";
  const lvl = props.lvl;

  return (
    <div className="move-body move-screen screen">
      <div className="move-left">
        <div className="move-name">{name}</div>
        <div className="move-stat">{padStats("Accuracy", acc, ".", 16)}</div>
        <div className="move-stat">{padStats("Power", pow, ".", 16)}</div>
        <div className="move-stat">{padStats("PP", pp, ".", 16)}</div>
      </div>
      <div className="move-right">
        <div className="move-type">Type: {type}</div>
        {/* <div className="move-status">Status Effect: {status}</div> */}
        <div className="move-learn">Learn: Lvl {lvl}</div>
      </div>
    </div>
  );
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
  const n1 = props.evoNames[0];
  const n2 = props.evoNames[1];
  const n3 = props.evoNames[2];

  return (
    <div className="panel-row panel-evo">
      <div className="panel-header evo-header">Evolutions</div>
      <PokemonSpriteSmall src={e1} evo="I" name={n1} />
      <PokemonSpriteSmall src={e2} evo="II" name={n2} />
      <PokemonSpriteSmall src={e3} evo="III" name={n3} />
    </div>
  );
}

function PokemonSpriteSmall(props) {
  let evoImage;

  if (props.src) {
    evoImage = (
      <img
        src={props.src}
        alt="pokemon"
        className="pokemon-sprite pokemon-sprite-small"
      />
    );
  } else {
    evoImage = <PokeBall />;
  }

  return (
    <div>
      <div className="flex-center">
        <div className="evo-num">{props.evo}</div>
      </div>
      {evoImage}
      <div className="screen evo-name">{props.name || "No Data"}</div>
    </div>
  );
}

function PokeBall(props) {
  return (
    <div className="pokemon-sprite pokemon-sprite-small empty-evo">
      <div className="poke-ball">
        <div className="poke-ball-top" />
        <div className="poke-ball-center">
          <div className="poke-ball-dot" />
        </div>
        <div className="poke-ball-bottom" />
      </div>
    </div>
  );
}

function PokedexControls(props) {
  return (
    <div className="panel-row controls">
      <Button dir="left" onClick={props.controls.prev} />
      <Button dir="right" onClick={props.controls.next} />
    </div>
  );
}

function Button(props) {
  return <div className="button" onClick={props.onClick} />;
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
