import ClanViewer from './index';
import * as d3 from 'd3-selection';

describe('constructor()', () => {
    it('should initialise the options', () => {
        const options = {
            "element":document.createElement('div'),
            "width":450,
            "height":250,
            "r":10,
            "testing":true
        };
        const obj = new ClanViewer(options);
        expect(obj).toMatchSnapshot();
    });
});

describe('#linkArc()', () => {
    it('should return the path for an arc', () => {
        const data = {
            "target":{"x":8, "y":2},
            "source":{"x":3, "y":6}
        };
        const arc = ClanViewer.linkArc(data);

        expect(arc).toMatchSnapshot();

    });
});

describe('#labelArc()', () => {
    it('should return the translate coordinates', () => {
        const data = {
            "target":{"x":8, "y":2},
            "source":{"x":3, "y":6}
        };
        ClanViewer.linkArc(data);
        const label = ClanViewer.labelArc(data);
        expect(label).toMatchSnapshot();
    });
});

describe('#processData(data)', () => {
    it('should create source and target objects in each element of data relationships', () => {
        // processData uses some values that should be initiated in the constructor, but given that we are calling
        // it in a static way, we set up those values here:
        const dataJson = {
            "members":[
                { "pfama_acc":"f1", "pfama_id":"id1", "num_occurrences":1},
                { "pfama_acc":"f2", "pfama_id":"id2", "num_occurrences":2}
            ],
            "relationships":[
                { "pfama_acc_1":"f1", "pfama_acc_2":"f2", "evalue":8.2e-6 }
            ]
        };
        const obj = new ClanViewer({r: 5});

        obj.processData(dataJson);
        expect(dataJson).toMatchSnapshot();
    });
});

describe('paint()', () => {
    const dataJson = {
        "members":[
            { "pfama_acc":"f1", "pfama_id":"id1", "num_occurrences":1},
            { "pfama_acc":"f2", "pfama_id":"id2", "num_occurrences":2}
        ],
        "relationships":[
            { "pfama_acc_1":"f1", "pfama_acc_2":"f2", "evalue":8.2e-6 },
            { "pfama_acc_1":"f1", "pfama_acc_2":"f2", "evalue":8.2e-7 },
            { "pfama_acc_1":"f2", "pfama_acc_2":"f1", "evalue":8.2e-5 }
        ]
    };
    it('should paint multiple relationships', function(){
        const root =document.createElement('div'),
            options = {
                "element": root,
                "testing":true,
                "multiple_relationships":true,
                "directional":true
            };
        const obj = new ClanViewer(options);

        obj.paint(dataJson);

        expect(obj.force.nodes().map(({x,y, ...rest}) => rest)).toMatchSnapshot();
        expect(dataJson.relationships.length).toBe(d3.select(root).selectAll(".link").size());
        expect(dataJson.members.length).toBe(d3.select(root).selectAll(".node").size());
        expect(d3.select(root).selectAll("marker").size()).toBe(1);
    });
});
