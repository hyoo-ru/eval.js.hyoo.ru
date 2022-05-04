namespace $.$$ {

	export class $hyoo_js_eval extends $.$hyoo_js_eval {
		
		@ $mol_mem
		code( next?: string ) {
			return this.$.$mol_state_arg.value( 'code', next ) ?? ''
		}
		
		@ $mol_mem
		run( next?: boolean ) {
			return this.$.$mol_state_arg.value( 'run', next?.valueOf && String( next ) ) !== 'false'
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Code_page(),
				... this.run() ? [ this.Result_page() ] : [],
			]
		}
		
		@ $mol_mem
		code_enhanced() {
			
			let code = this.code()
			
			code = code.replaceAll(
				/^(?:const|var|let) +(\w+)/mig,
				( found, name )=> `this.spy( ()=>[ "${name} =", ${name} ] )\n${found}`
			)
			
			return code
		}
		
		@ $mol_mem
		execute() {
			
			const console = new Proxy( globalThis.console, {
				get: ( target, field )=> {
					
					if( typeof target[ field ] !== 'function' ) return target[ field ]
					
					return ( ... args: any[] )=> {
						this.spy( ()=> [ `console.${field}:`, ... args ] )
						return target[ field ]( ... args )
					}
					
				}
			} )
			
			return eval( this.code_enhanced() )
			
		}
		
		spy( args: ()=> any[] ) {
			Promise.resolve().then( ()=> {
				this.result([ ... this.result(), args() ])
			} )
		}

		@ $mol_mem
		result( next?: any[] ) {
			
			this.code()
			if( next ) return next
			
			return [ [ '=', this.execute() ] ]
			
		}
		
		@ $mol_mem
		logs() {
			return this.result().map( (_,index)=> this.Log( index ) )
		}
		
		@ $mol_mem_key
		log( index: number ) {
			return this.result()[ index ]
		}

	}
	
	export class $hyoo_js_eval_log extends $.$hyoo_js_eval_log {
		
		@ $mol_mem
		sub() {
			return this.values().map( (_,index)=> this.Dump( index ) )
		}
		
		@ $mol_mem_key
		dump_value( index: number ) {
			return this.values()[ index ]
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
			return Reflect.ownKeys( value )
		}
		
		@ $mol_mem
		expand_content() {
			return this.inner_keys().map( (_,index)=> this.Inner( index ) )
		}
		
		@ $mol_mem_key
		inner_key( index: number ) {
			return this.inner_keys()[ index ]
		}

		@ $mol_mem_key
		inner_value( index: number ) {
			const key = this.inner_key( index )
			return Reflect.getOwnPropertyDescriptor( this.value(), key )?.value
		}

	}
	
}
