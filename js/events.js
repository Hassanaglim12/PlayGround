/* Random events engine: ~42 events with choices */
window.EVENTS = [
{id:"quake",t:"🌊 Earthquake strikes!",d:"A magnitude 6.8 earthquake hit a coastal province. Thousands homeless. Advisors await orders.",choices:[
 {label:"Massive relief ($, +approval)",fx:{treasuryPct:-0.06,approval:8,stability:4},msg:"Relief convoys deployed. The nation praises your compassion."},
 {label:"Limited aid (save money)",fx:{approval:-6,stability:-4},msg:"Critics call you heartless as tents fill the stadiums."},
 {label:"Ask UN for aid (+relations)",fx:{approval:2,prestige:6},msg:"The world sends aid. Flags of many nations fly over relief camps."}]},
{id:"boom",t:"📈 Economic boom!",d:"Exports are surging. Economists urge you to capitalize on the momentum.",choices:[
 {label:"Invest surplus",fx:{treasuryPct:0.08,gdpGrowth:1.2,approval:3},msg:"Treasury swells. Markets cheer."},
 {label:"Cut taxes & celebrate",fx:{approval:7,gdpGrowth:0.5,treasuryPct:-0.02},msg:"Streets celebrate. Your polls jump."},
 {label:"Build reserves",fx:{treasuryPct:0.12,stability:3},msg:"Prudent. Rating agencies upgrade your outlook."}]},
{id:"scandal",t:"📰 Corruption scandal!",d:"A minister was caught diverting funds. Media demands action.",choices:[
 {label:"Fire & prosecute (+approval, -$)",fx:{approval:6,stability:5,treasuryPct:-0.01},msg:"Justice served. Trust restored."},
 {label:"Cover it up",fx:{approval:-9,stability:-6,prestige:-8},msg:"Leaks explode. The cover-up is worse than the crime."},
 {label:"Blame opposition",fx:{approval:-3,prestige:-4,stability:-3},msg:"Nobody buys it. Late-night comedians feast."}]},
{id:"pandemic",t:"🦠 Virus outbreak!",d:"Hospitals report a new respiratory virus spreading fast.",choices:[
 {label:"Lockdown + fund health",fx:{treasuryPct:-0.08,gdpGrowth:-1.5,approval:2,stability:4,healthBonus:1},msg:"Cases fall. Doctors call you a lifesaver."},
 {label:"Keep economy open",fx:{gdpGrowth:0.8,approval:-5,stability:-5},msg:"Markets stay open, morgues overflow. Grim headlines."},
 {label:"Balanced response",fx:{treasuryPct:-0.03,approval:1},msg:"A middle path. Nobody loves it, nobody hates it."}]},
{id:"oil",t:"🛢️ Oil discovered!",d:"Geologists found offshore reserves. Energy firms bid billions.",choices:[
 {label:"Nationalize it",fx:{treasuryPct:0.15,approval:4,prestige:-3},msg:"'Our oil!' crowds chant. Foreign investors grumble."},
 {label:"Sell drilling rights",fx:{treasuryPct:0.2,gdpGrowth:1.0,approval:-2},msg:"Cash floods in. Environmentalists protest."},
 {label:"Green ban (eco +prestige)",fx:{prestige:10,approval:-3,gdpGrowth:-0.5},msg:"The world applauds your climate courage."}]},
{id:"cyber",t:"💻 Massive cyberattack!",d:"Power grids flicker. Intelligence blames foreign hackers.",choices:[
 {label:"Retaliate + harden grid ($)",fx:{treasuryPct:-0.05,stability:5,prestige:4},msg:"Firewalls up. Attackers retreat."},
 {label:"Quietly pay ransom",fx:{treasuryPct:-0.04,stability:-4,approval:-4},msg:"Lights return, but rumors of weakness spread."},
 {label:"Blame publicly at UN",fx:{prestige:-2,stability:-2,approval:2},msg:"Fiery speech goes viral — and escalates tensions."}]},
{id:"protest",t:"✊ Mass protests!",d:"Tens of thousands march on the capital demanding reforms.",choices:[
 {label:"Dialogue & reforms",fx:{approval:7,stability:6,treasuryPct:-0.03},msg:"You meet leaders. Tear gas replaced by handshakes."},
 {label:"Crack down",fx:{stability:-8,approval:-10,prestige:-10},msg:"Chaos on live TV. Sanctions threatened abroad."},
 {label:"Ignore them",fx:{approval:-5,stability:-5},msg:"Chants grow louder each night."}]},
{id:"summit",t:"🤝 Global summit invite",d:"You are invited to headline a peace & climate summit.",choices:[
 {label:"Attend & lead (+prestige)",fx:{prestige:12,treasuryPct:-0.01,approval:3},msg:"Standing ovation. Your photo is everywhere."},
 {label:"Send deputy",fx:{prestige:2},msg:"Polite applause. Missed opportunity."},
 {label:"Boycott summit",fx:{prestige:-8,approval:-2},msg:"Empty chair with your flag. Memes follow."}]},
{id:"drought",t:"🌾 Drought & famine risk",d:"Crops fail for the second season. Food prices spike.",choices:[
 {label:"Emergency food program",fx:{treasuryPct:-0.07,approval:6,stability:5},msg:"Bread lines shrink. Mothers bless your name."},
 {label:"Import at any cost",fx:{treasuryPct:-0.05,gdpGrowth:-0.5,approval:2},msg:"Ships full of grain save the harvest gap."},
 {label:"Let market adjust",fx:{approval:-8,stability:-7},msg:"Hunger riots. A terrible month."}]},
{id:"terror",t:"💥 Terror attack!",d:"An attack shocks the nation. Fear spreads.",choices:[
 {label:"Security surge + unity speech",fx:{treasuryPct:-0.04,stability:4,approval:5},msg:"'We stand together.' Approval rallies."},
 {label:"Declare emergency powers",fx:{stability:6,approval:-6,prestige:-6},msg:"Streets calm, liberties debated."},
 {label:"Downplay it",fx:{approval:-7,stability:-6},msg:"'Nothing to see here' backfires badly."}]},
{id:"tech",t:"🤖 AI breakthrough!",d:"Your universities announce a world-class AI lab. Investors circle.",choices:[
 {label:"State fund it",fx:{treasuryPct:-0.04,gdpGrowth:2.0,prestige:8},msg:"Tech unicorns bloom. GDP forecast raised!"},
 {label:"Let private sector lead",fx:{gdpGrowth:1.0,treasuryPct:0.02},msg:"Venture capital floods in."},
 {label:"Regulate heavily",fx:{approval:2,stability:2,gdpGrowth:-0.5},msg:"Safety first. Founders grumble."}]},
{id:"defect",t:"🕵️ Diplomat defects!",d:"A foreign diplomat seeks asylum with a briefcase of secrets.",choices:[
 {label:"Grant asylum (+intel, -relations)",fx:{prestige:4,stability:-2,approval:3,relAll:-5},msg:"Secrets secured. An embassy fumes."},
 {label:"Quietly deport",fx:{stability:2,prestige:-3},msg:"A whisper deal. Nobody proud."},
 {label:"Parade on TV",fx:{approval:6,prestige:-8,relAll:-10},msg:"Ratings soar. Diplomats panic."}]},
{id:"olymp",t:"🏟️ Host the Games?",d:"The Olympic committee offers you the next games — glory and bills.",choices:[
 {label:"Bid & build!",fx:{treasuryPct:-0.1,prestige:15,approval:6,gdpGrowth:1.0},msg:"Stadiums rise! The world is coming."},
 {label:"Decline politely",fx:{prestige:-2},msg:"Economists sigh with relief."},
 {label:"Co-host cheaply",fx:{treasuryPct:-0.03,prestige:6,approval:2},msg:"Smart deal. Shared glory."}]},
{id:"strike",t:"🏭 General strike!",d:"Unions shut down transport demanding wages.",choices:[
 {label:"Raise wages ($)",fx:{treasuryPct:-0.05,approval:7,stability:6},msg:"Whistles blow, trains roll again."},
 {label:"Break strike",fx:{stability:-6,approval:-8},msg:"Clashes on picket lines. Ugly footage."},
 {label:"Negotiate compromise",fx:{treasuryPct:-0.02,approval:3,stability:3},msg:"Long nights, signed deal at dawn."}]},
{id:"space",t:"🚀 Space program milestone!",d:"Your rocket reached orbit! The nation watches the skies.",choices:[
 {label:"Fund Moon shot",fx:{treasuryPct:-0.07,prestige:14,approval:8},msg:"'To the Moon!' Children dream big."},
 {label:"Sell satellite services",fx:{treasuryPct:0.06,prestige:5},msg:"Profitable orbit. Treasury smiles."},
 {label:"Cut program",fx:{treasuryPct:0.02,prestige:-6,approval:-4},msg:"Engineers emigrate. Dreams deflate."}]},
{id:"refugee",t:"🧳 Refugee wave",d:"War next door pushes thousands to your border.",choices:[
 {label:"Open borders (+prestige, $)",fx:{treasuryPct:-0.05,prestige:10,approval:-2,stability:-2},msg:"UN praises you. Border towns strain."},
 {label:"Closed borders",fx:{prestige:-10,approval:3,stability:2},msg:"Fences rise. The world frowns."},
 {label:"Camps + aid appeal",fx:{prestige:5,treasuryPct:-0.02},msg:"Orderly camps. Shared burden."}]},
{id:"bankrun",t:"🏦 Bank panic!",d:"Rumors trigger withdrawals at major banks.",choices:[
 {label:"Bailout & guarantee",fx:{treasuryPct:-0.09,stability:8,gdpGrowth:-0.5},msg:"Calm returns. Bankers owe you."},
 {label:"Let one fail",fx:{gdpGrowth:-2.0,stability:-6,approval:-6},msg:"Contagion! ATMs empty."},
 {label:"Nationalize banks",fx:{stability:3,approval:4,prestige:-5,gdpGrowth:-1.0},msg:"Bold. Markets shiver."}]},
{id:"election_med",t:"🗳️ Midterm elections",d:"Midterms loom. Party begs for campaign cash.",choices:[
 {label:"Campaign hard ($)",fx:{treasuryPct:-0.03,approval:6},msg:"Rallies roar. Base energized."},
 {label:"Focus on governing",fx:{approval:-2,stability:2},msg:"Boring competence. Pundits yawn."},
 {label:"Smear opponents",fx:{approval:-4,stability:-4},msg:"Mud flies. Everyone dirty."}]},
{id:"nobel",t:"🏅 Nobel buzz",d:"Your peace initiative is shortlisted for the Nobel Prize!",choices:[
 {label:"Push diplomacy",fx:{prestige:12,approval:4},msg:"Oslo calls... Glory!"},
 {label:"Stay humble",fx:{prestige:5,approval:2},msg:"Graceful. World nods."},
 {label:"Brag early",fx:{prestige:-5,approval:-3},msg:"You jinxed it. Awkward."}]},
{id:"military_coup_risk",t:"⚠️ Generals grumble",d:"Intelligence: some generals plot if military budget stays low.",choices:[
 {label:"Raise military budget",fx:{treasuryPct:-0.04,stability:6,milBonus:1},msg:"Salutes sharpen. Barracks quiet."},
 {label:"Purge plotters",fx:{stability:-3,approval:-2,prestige:-4},msg:"Midnight arrests. Risky but bold."},
 {label:"Call their bluff",fx:{stability:-8},msg:"Tanks... stay parked. This time."}]},
{id:"trade_boom",t:"🚢 Trade winds favor you",d:"A trade partner offers a sweet deal.",choices:[
 {label:"Sign free-trade pact",fx:{gdpGrowth:1.5,treasuryPct:0.04,prestige:4},msg:"Ports buzz. Containers pile high."},
 {label:"Protect local industry",fx:{approval:3,gdpGrowth:-0.5,stability:2},msg:"Factory towns cheer."},
 {label:"Demand better terms",fx:{gdpGrowth:0.5,prestige:-2},msg:"Hardball. Deal delayed."}]},
{id:"ufo",t:"🛸 Mystery in the sky!",d:"Pilots report strange lights. Public demands answers.",choices:[
 {label:"Full disclosure fun",fx:{approval:5,prestige:2},msg:"Memes explode. Tourism to desert rises."},
 {label:"Deny everything",fx:{approval:-3},msg:"Nobody believes you anyway."},
 {label:"Fund investigation",fx:{treasuryPct:-0.01,prestige:3,approval:2},msg:"Scientists intrigued."}]},
{id:"sport_win",t:"🏆 Championship glory!",d:"Your national team reaches the World Cup final!",choices:[
 {label:"Attend final & bonus team",fx:{treasuryPct:-0.01,approval:8},msg:"GOAL! The nation dances in streets!"},
 {label:"Ignore sports",fx:{approval:-5},msg:"'Out of touch!' fume fans."},
 {label:"Declare holiday if we win",fx:{approval:10,gdpGrowth:-0.3},msg:"Legendary celebration!"}]},
{id:"ai_jobs",t:"🏭 Robots take jobs",d:"Automation wave causes layoffs. Unions march.",choices:[
 {label:"Retrain workers ($)",fx:{treasuryPct:-0.05,gdpGrowth:1.0,approval:4},msg:"New skills, new jobs."},
 {label:"Robot tax",fx:{treasuryPct:0.05,approval:3,gdpGrowth:-0.5},msg:"Clever. Treasury + workers win."},
 {label:"Do nothing",fx:{approval:-7,stability:-5},msg:"Rust belts rage."}]},
{id:"climate_flood",t:"🌊 Floods devastate coast",d:"Rising seas flood a major city.",choices:[
 {label:"Rebuild greener",fx:{treasuryPct:-0.08,prestige:6,approval:5},msg:"Green seawalls rise."},
 {label:"Quick patch",fx:{treasuryPct:-0.02,approval:-2},msg:"Water returns next storm."},
 {label:"Relocate city",fx:{treasuryPct:-0.06,stability:-3,approval:-4},msg:"Painful, historic move."}]},
{id:"assassination",t:"🔫 Assassination attempt!",d:"Shots fired at your motorcade! You survive.",choices:[
 {label:"Unity address",fx:{approval:12,stability:5},msg:"Sympathy wave. Nation rallies around you."},
 {label:"Crackdown on enemies",fx:{stability:-4,approval:-3,prestige:-6},msg:"Fear spreads faster than healing."},
 {label:"Forgive publicly",fx:{prestige:10,approval:6},msg:"Grace under fire. World moved."}]},
{id:"debt_crisis",t:"💳 Debt collectors knock",d:"IMF warns: debt unsustainable.",choices:[
 {label:"Austerity now",fx:{treasuryPct:0.08,approval:-8,stability:-4},msg:"Painful medicine."},
 {label:"Borrow more",fx:{treasuryPct:0.1,gdpGrowth:0.5,stability:-3},msg:"Can kicked down road."},
 {label:"Debt jubilee plea",fx:{prestige:-4,treasuryPct:0.05,approval:2},msg:"Begging works... a bit."}]},
{id:"culture_viral",t:"🎬 Culture goes viral!",d:"Your country's pop music tops global charts!",choices:[
 {label:"Fund cultural export",fx:{treasuryPct:-0.01,prestige:10,approval:5,gdpGrowth:0.5},msg:"The world dances to your beat!"},
 {label:"Tax the stars",fx:{treasuryPct:0.03,approval:-2},msg:"Accountants cheer, artists boo."},
 {label:"Ride the wave (tourism)",fx:{treasuryPct:0.04,gdpGrowth:0.8,prestige:5},msg:"Tourists flood in!"}]},
{id:"border_skirmish",t:"🔥 Border skirmish!",d:"Shots exchanged at the border. A neighbor masses troops.",choices:[
 {label:"De-escalate via hotline",fx:{prestige:5,stability:3},msg:"Midnight calls avert war."},
 {label:"Mobilize army ($)",fx:{treasuryPct:-0.05,stability:-3,prestige:3,milBonus:1},msg:"Deterrence holds... for now."},
 {label:"Counter-attack!",fx:{stability:-10,prestige:-8,approval:-2},msg:"War drums! The world holds breath."}]},
{id:"whistleblower",t:"📁 Whistleblower leaks",d:"Secret surveillance program exposed.",choices:[
 {label:"Apologize & reform",fx:{approval:4,prestige:3,stability:2},msg:"Transparency wins."},
 {label:"Arrest whistleblower",fx:{approval:-7,prestige:-8},msg:"Streets chant their name."},
 {label:"Deny & distract",fx:{approval:-4,stability:-3},msg:"News cycle spins on."}]},
{id:"good_harvest",t:"🌽 Record harvest!",d:"Best wheat yields in decades!",choices:[
 {label:"Export surplus",fx:{treasuryPct:0.07,gdpGrowth:0.8},msg:"Grain ships sail full."},
 {label:"Stockpile reserves",fx:{stability:5,treasuryPct:-0.01},msg:"Silos full. Future safe."},
 {label:"Feast & festivals",fx:{approval:8,treasuryPct:-0.02},msg:"Joy! Tables overflow."}]},
{id:"nuclear_bid",t:"☢️ Nuclear question",d:"Advisors propose a nuclear weapons program.",choices:[
 {label:"Build the bomb ($$$)",fx:{treasuryPct:-0.12,prestige:-15,stability:-5,milBonus:2},msg:"The world condemns. Generals grin."},
 {label:"Nuclear energy only",fx:{gdpGrowth:1.0,prestige:4,treasuryPct:-0.03},msg:"Clean power hums."},
 {label:"Sign non-proliferation",fx:{prestige:10,approval:2},msg:"Doves cheer worldwide."}]},
{id:"internet_blackout",t:"📡 Internet blackout",d:"Undersea cable cut! Nation offline.",choices:[
 {label:"Emergency repair fleet",fx:{treasuryPct:-0.03,stability:4},msg:"Back online in days."},
 {label:"Build sovereign net",fx:{treasuryPct:-0.06,stability:3,prestige:2},msg:"Never again. Hackers impressed."},
 {label:"Blame enemy hackers",fx:{approval:2,stability:-3,relAll:-4},msg:"Conspiracies trend #1."}]},
{id:"royal_visit",t:"👑 Royal state visit",d:"A beloved monarch visits. Pomp awaits.",choices:[
 {label:"Grand ceremony",fx:{treasuryPct:-0.01,prestige:7,approval:4},msg:"Crowns & cameras. Splendid!"},
 {label:"Business-first talks",fx:{treasuryPct:0.03,gdpGrowth:0.5},msg:"Deals over dinners."},
 {label:"Snub them",fx:{prestige:-9,approval:-4},msg:"Diplomatic ice age."}]},
{id:"lottery_boom",t:"💰 Tax windfall!",d:"Better collection + fines fill coffers unexpectedly.",choices:[
 {label:"Pocket it (reserves)",fx:{treasuryPct:0.08},msg:"Auditors smile."},
 {label:"Refund citizens",fx:{approval:9,treasuryPct:-0.02},msg:"Checks in mail! You hero!"},
 {label:"Splurge on army",fx:{treasuryPct:-0.01,milBonus:1,prestige:2},msg:"New jets roar overhead."}]},
{id:"volcano",t:"🌋 Volcano erupts!",d:"Ash cloud grounds flights. Villages evacuated.",choices:[
 {label:"Full evacuation & aid",fx:{treasuryPct:-0.05,approval:6},msg:"Lives saved. Ash settles."},
 {label:" Pray & wait",fx:{approval:-6,stability:-5},msg:"Lava does not wait."},
 {label:"Sell volcano tourism",fx:{treasuryPct:0.02,prestige:3},msg:"Daredevils book flights!"}]},
{id:"spy_caught",t:"🕶️ Your spy caught!",d:"Your agent arrested abroad. Scandal brews.",choices:[
 {label:"Deny & swap",fx:{prestige:-4,stability:1},msg:"Quiet bridge exchange at dawn."},
 {label:"Admit & apologize",fx:{prestige:-2,approval:-2},msg:"Honesty stings less."},
 {label:"Claim hero & escalate",fx:{approval:4,prestige:-10,relAll:-6},msg:"Posters print. Embassies close."}]},
{id:"health_cure",t:"💊 Medical miracle!",d:"Your scientists cure a rare disease!",choices:[
 {label:"Free for world (+prestige)",fx:{prestige:15,approval:7,treasuryPct:-0.02},msg:"Humanity cheers your flag!"},
 {label:"Patent & profit",fx:{treasuryPct:0.1,gdpGrowth:1.0,prestige:-3},msg:"Billions flow. Ethics debated."},
 {label:"Share with allies only",fx:{prestige:4,treasuryPct:0.04},msg:"Friends first."}]},
{id:"election_interfere",t:"🐴 Foreign meddling claims",d:"Intel says a rival funds disinformation.",choices:[
 {label:"Sanction them",fx:{prestige:-3,stability:3,relAll:-8},msg:"Wallets frozen. Trolls rage."},
 {label:"Expose publicly",fx:{approval:4,prestige:2,relAll:-5},msg:"Evidence on primetime TV."},
 {label:"Retaliate in kind",fx:{stability:-4,prestige:-6},msg:"Shadow war in the wires."}]},
{id:"gold_find",t:"⛏️ Gold rush!",d:"Huge lithium deposits found — 'white gold'!",choices:[
 {label:"State mines",fx:{treasuryPct:0.12,gdpGrowth:1.5},msg:"Battery world kneels to you."},
 {label:"Auction to multinationals",fx:{treasuryPct:0.15,approval:-3},msg:"Cash now, control later?"},
 {label:"Eco-protect it",fx:{prestige:8,approval:2},msg:"Green gold stays buried."}]},
{id:"coup_attempt",t:"🚨 Coup attempt!",d:"Tanks roll toward the palace at 3AM!",choices:[
 {label:"Rally people (risky)",fx:{approval:5,stability:-5},msg:"You face cameras... crowds shield palace!"},
 {label:"Flee & negotiate",fx:{approval:-8,stability:-8},msg:"Exile hotels are comfortable. Power isn't."},
 {label:"Loyal forces strike",fx:{treasuryPct:-0.05,stability:2,approval:-2},msg:"Dawn gunfire. Loyalists hold!"}]},
{id:"festival",t:"🎉 National festival!",d:"Independence day! Mood is high.",choices:[
 {label:"Grand parade ($)",fx:{treasuryPct:-0.02,approval:7,prestige:4},msg:"Fireworks! Goosebumps!"},
 {label:"Modest ceremony",fx:{approval:2},msg:"Nice. Nobody bankrupt."},
 {label:"Cancel (austerity)",fx:{approval:-6,treasuryPct:0.01},msg:"Grumbles over silent streets."}]}
];
