class CollectionFilter {
    constructor(data, params, model) {
        this.data = data;
        this.params = params;
        this.model = model;
    }

    get() {
        if (!this.params) {
            return this.data;
        }

        let filteredData = [...this.data];

        let fieldInfo;

        if (this.params.sort) {
            let sortParams = this.params.sort.split(',');
            let sortField = sortParams[0];
            let sortOrder = sortParams[1];
            fieldInfo = this.getFieldInfo(sortField);
            if(sortField === "Category")
                sortOrder = "desc";
            if (fieldInfo)
                filteredData = this.sortData(filteredData, fieldInfo, sortOrder);
        }

        if (this.params.fields) {
            const fieldsToInclude = this.params.fields.split(',');
            filteredData = this.filterFields(filteredData, fieldsToInclude);
        }
        if (this.params.field) {
            const fieldsToInclude = this.params.field.split(',');

            filteredData = this.filterFields(filteredData, fieldsToInclude);

            const distinctFields = this.params.field.split(',');
            filteredData = this.filterDistinctFields(filteredData, distinctFields);
        }

        if (this.params) {
            for (const filter in this.params) {
                const fieldInfo = this.getFieldInfo(filter);

                if (fieldInfo)
                    filteredData = this.filterByField(filteredData, fieldInfo, this.params[filter]);
            }
        }
        // Apply pagination (limit and offset)
        if (this.params.limit && this.params.offset) {
            const limit = parseInt(this.params.limit);
            const offset = parseInt(this.params.offset);
            filteredData = filteredData.slice(offset, offset + limit);
        }

        return filteredData;
    }

    filterFields(data, fieldsToInclude) {
        return data.map(item => {
            const newRenderField = {};
            fieldsToInclude.forEach(fieldName => {
                if (item[fieldName] !== undefined) {
                    newRenderField[fieldName] = item[fieldName];
                }
            });
            return newRenderField;
        });
    }
    filterDistinctFields(data, distinctFields) {
        return data.filter((item, index, self) => {
            return distinctFields.some(field => self.map(x => x[field]).indexOf(item[field]) === index);
        });
    }
    filterByField(data, fieldInfo, filterValue) {
        return data.filter(item => {
            const fieldValue = item[fieldInfo.name];

            if (filterValue.startsWith('*') && filterValue.endsWith('*')) {
                const search = filterValue.substring(1, filterValue.length - 1);
                return fieldValue.includes(search);
            } else if (filterValue.startsWith('*')) {
                const search = filterValue.substring(1);
                return fieldValue.endsWith(search);
            } else if (filterValue.endsWith('*')) {
                const search = filterValue.substring(0, filterValue.length - 1);
                return fieldValue.startsWith(search);
            } else {
                return fieldValue === filterValue;
            }
        });
    }

    getFieldInfo(fieldName) {
        return  this.model.fields.find(field => field.name === fieldName);
    }

    sortData(data, fieldInfo, sortOrder) {
        if (sortOrder === 'desc') {
            return data.sort((a, b) => b[fieldInfo.name].localeCompare(a[fieldInfo.name]));
        } else {
            return data.sort((a, b) => a[fieldInfo.name].localeCompare(b[fieldInfo.name]));
        }
    }
}

export { CollectionFilter };
