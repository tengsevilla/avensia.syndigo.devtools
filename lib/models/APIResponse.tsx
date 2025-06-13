export interface IAPIResponse {
    id: string;
    name: string;
    type: string;
    properties: {
        createdService: string;
        createdBy: string;
        createdDate: string;
        originatingUser: string;
        modifiedService: string;
        modifiedBy: string;
        modifiedDate: string;
    };
    data: {
        attributes: IAttributes;
        relationships: IRelationships;
    };
}

// Define the structure for individual values in each attribute
export interface IAttributeValue {
    id: string;
    value: string | boolean | number | null;
    locale: string;
    source: string;
    os?: string;
    osid?: string;
    ostype?: string;
    properties?: IReferenceDataProperties;
}


export interface IReferenceDataProperties {
    referenceDataIdentifier?: string;
    referenceData?: string;
    refIdPath?: string;
}

// Define a dynamic structure for attributes
export interface IAttributes {
    [key: string]: {
        values: IAttributeValue[]
        group?: any[]
    }
}


// // Define a dynamic structure for relationship attributes
// export interface RelationshipAttributes  {
//     [key: string]: AttributeValue[];
// }

interface IRelationshipAttributes {
    [key: string]: {
        values: Array<{
            id: string;
            value: string | boolean | number | null;
            locale: string;
            os: string;
            osid: string;
            ostype: string;
            source: string;
        }>;
    };
}
// Define the structure for relationships
export interface IRelationship {
    id: string;
    relTo: {
        id: string;
        type: string;
    };
    properties: {
        direction: string;
        relationshipType: string;
    };
    attributes?: IRelationshipAttributes; // attributes may be optional
}

// Define the structure for 'relationships'
export interface IRelationships {
    [key: string]: IRelationship[];
}

export interface IEntity {
    id: string;
    name: string;
    type: string;
    properties: {
        createdService: string;
        createdBy: string;
        createdDate: string;
        originatingUser: string;
        modifiedService: string;
        modifiedBy: string;
        modifiedDate: string;
    };
}