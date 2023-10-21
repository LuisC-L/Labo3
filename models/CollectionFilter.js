// collectionFilter.js

export class CollectionFilter {
    constructor(data, params, model) {
        this.data = data;
        this.params = params;
        this.model = model;
    }

    filterData() {
        if (!this.params) return;
    
        for (let param in this.params) {
            let field = this.model.getFieldByName(param);
            if (field) {
                let filterValue = this.params[param];
                let fieldName = field.name;
    
                switch (field.type) {
                    case 'string':
                        this.data = this.data.filter(item => this.valueMatch(item[fieldName], filterValue));
                        break;
                    case 'url':
                        this.data = this.data.filter(item => item[fieldName] === filterValue);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    

    sortData() {
        if (!this.params || !this.params.sort) return;
    
        let sortParams = this.params.sort.split(',');
        let fieldName = sortParams[0];
        let sortOrder = sortParams[1] === 'desc' ? -1 : 1;
    
        this.data.sort((a, b) => this.compareNum(a[fieldName], b[fieldName]) * sortOrder);
    }
    

    limitData() {
        if (!this.params || !this.params.limit) return;

        let limit = parseInt(this.params.limit);
        let offset = this.params.offset ? parseInt(this.params.offset) : 0;

        this.data = this.data.slice(offset, offset + limit);
    }


    selectFields() {
        if (!this.params || !this.params.fields) return;

        const selectedFields = this.params.fields.split(',');


        this.data = this.data.map(item => {
            const selectedItem = {};
            selectedFields.forEach(field => {
                selectedItem[field] = item[field];
            });
            return selectedItem;
        });
    }

    valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1; return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else return this.compareNum(x, y);
    }

    get() {
        this.filterData();
        this.sortData();
        this.limitData();
        this.selectFields();
        return this.data;
    }

    
}
