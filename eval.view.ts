namespace $.$$ {

	export class $hyoo_js_eval extends $.$hyoo_js_eval {
		
		@ $mol_mem
		code( next?: string ) {
			return this.$.$mol_state_arg.value( 'code', next ) ?? ''
		}
		
		@ $mol_mem
		run( next?: boolean ) {
			return this.$.$mol_state_arg.value( 'run', next?.valueOf && ( next ? '' : null ) ) !== null
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Code_page(),
				... this.run() ? [ this.Result_page() ] : [],
			]
		}
		
		@ $mol_mem
		result() {
			return this.$.$mol_js_eval( this.code() )
		}

	}
	
	export class $hyoo_js_eval_dump extends $.$hyoo_js_eval_dump {
		
		@ $mol_mem
		sub() {
			
			const value = this.value()
			
			const prefix = this.key() === null ? [] : [ this.Key() ]
			
			if( value && ( typeof value === 'object' ) ) {
				return [ ...prefix, this.Expand() ]
			}
			
			return [ ... prefix, this.Simple() ]
		}
		
		@ $mol_mem
		simple() {
			return String( this.value() ) + this.suffix()
		}
		
		@ $mol_mem
		expand_title() {
			
			const value = this.value()
			
			return Reflect.getOwnPropertyDescriptor( value, Symbol.toStringTag )?.value
				?? Reflect.getPrototypeOf( value )!.constructor.name
			
		}
		
		@ $mol_mem
		inner_keys() {
			let value = this.value()
			return Reflect.ownKeys( value  )
		}
		
		@ $mol_mem
		expand_content() {
			return this.inner_keys().map( (_,index)=> this.Inner( index ) )
		}
		
		@ $mol_mem
		inner_key( index: number ) {
			return this.inner_keys()[ index ]
		}

		@ $mol_mem
		inner_value( index: number ) {
			const key = this.inner_key( index )
			return Reflect.getOwnPropertyDescriptor( this.value(), key )?.value
		}

	}
	
}
