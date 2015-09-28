# clanViewer

[![NPM version](http://img.shields.io/npm/v/clanviewer.svg)](https://www.npmjs.org/package/clanviewer) 
[![Build Status](https://secure.travis-ci.org/4ndr01d3/clanviewer.png?branch=master)](http://travis-ci.org/4ndr01d3/clanviewer) 
[![Coverage Status](https://coveralls.io/repos/4ndr01d3/clanviewer/badge.svg?branch=master&service=github)](https://coveralls.io/github/4ndr01d3/clanviewer?branch=master)

> A component to visualise the relationships between the Pfam families in a clan

## Getting Started
Install the module with: `npm install clanviewer`

```javascript
var clanviewer = require("clanviewer");
var instance = new clanviewer({el: rootDiv});
data = {};
instance.paint(data);
```

## Documentation

#### constructor(options)
The 'constructor' method is responsible for capturing the parameters and setting up the space.

All the options are optional including the option parameter itself.
 
**Parameter**: `options`
**Type**: `Object`
**Default**: `{}`
**Example**: `{"el":"body"}`

**Parameter**: `options.el`
**Type**: `String`
**Default**: `"body"`
**Example**: `"div.target"`

**Parameter**: `options.width`
**Type**: `Integer`
**Default**: `900`
**Example**: `800`

**Parameter**: `options.height`
**Type**: `Integer`
**Default**: `500`
**Example**: `600`

**Parameter**: `options.r`
**Type**: `Integer`
**Default**: `5`
**Example**: `8`

How to use this method

```javascript
var instance = new clanviewer({el: rootDiv});
```

#### .paint(data)
The 'paint' method receives a json object and generates a force-directed layout that maps the memebers with ith interactions.

**Parameter**: `data`
**Type**: `Object`
**Example**:
 
```
{
    "accession":"CL0050",
    "id":"HotDog",
    "members":[
      { "accession":"PF03061", "link":"http://pfam.xfam.org/family/PF03061", "id":"4HBT", "num_occurrences":88944, "percentage_hits":34.7 },
      { "accession":"PF01643", "link":"http://pfam.xfam.org/family/PF01643", "id":"Acyl-ACP_TE", "num_occurrences":7178, "percentage_hits":2.8 },
    ],
    "interactions":[
      { "member_id_1":"4HBT", "member_id_2":"Acyl-ACP_TE", "e_value":8.2e-6 }
    ]
}
```

How to use this method

```javascript
instance.paint(data);
```

## Contributing

All contributions are welcome.

## Support

If you have any problem or suggestion please open an issue [here](https://github.com/4ndr01d3/clanviewer/issues).

## License 
This software is licensed under the Apache 2 license, quoted below.

Copyright (c) 2015, gsalazar

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
